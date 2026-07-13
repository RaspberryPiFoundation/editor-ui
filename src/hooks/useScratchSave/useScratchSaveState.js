import { useCallback, useEffect, useEffectEvent, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getScratchAllowedOrigin,
  postMessageToScratchIframe,
} from "../../utils/scratchIframe";
import {
  scratchSaveFailed,
  scratchSaveStarted,
  scratchSaveSucceeded,
} from "../../redux/EditorSlice";
import { createScratchSaveLifecycle } from "./scratchSaveLifecycle";
import { useScratchSaveNavigationFlush } from "./useScratchSaveNavigationFlush";

/**
 * Scratch autosave state machine (iframe postMessage transport).
 *
 * Wired from useScratchSave when enableScratchSaveState is set; autosave scheduling
 * runs only when autoSaveEnabled (saved project, not remix-on-first-save).
 * Shared timing and host API: utils/save/. Python/HTML equivalent: hooks/useAutoSave.
 *
 * Pipeline: scratch-gui-project-changed → debounce → postMessage save → queue / throttle / in-flight
 *
 * This hook owns:
 * - Debounce (2s) — scratchSaveLifecycle.requestAutoSave after project-changed
 *   - Fixed 2s (AUTOSAVE_DEBOUNCE_MS); Scratch has no large-project debounce path
 *   - Repeated edits coalesce into one timer; flushQueuedSave may re-enter with remaining debounce
 * - Throttle (10s after a successful autosave) — scratchSaveLifecycle + autoSaveScheduling
 *   - Same 10s window as Python/HTML; clock starts on autosave success only
 * - Queue (edits while in-flight or in throttle) — schedulerRef.queued
 *   - Blocked while a save is in flight
 *   - Also queues during throttle; when allowed, saves once with the latest edits
 * - Navigation flush — useScratchSaveNavigationFlush + autoSaveHostApi (Scratch registration)
 *   - SPA navigation (editor-standalone blocker): await iframe save, bypassing throttle
 *   - Tab close / external leave: beforeunload warns only; pagehide fires flush best-effort (not awaited)
 *   - shouldFlushBeforeNavigation = dirty; hasPendingAutoSave = dirty + queued/in-flight/throttle
 *
 * Debounce and throttle work in sequence: debounce waits for a pause in block edits before
 * posting a save to the iframe; throttle then limits how often a successful autosave can run
 * (at most once per 10s). Edits during throttle are queued, not dropped — when the window ends,
 * one save runs with the latest project state.
 *
 * Scheduling: ./scratchSaveLifecycle. Iframe messages: useEffect below.
 */
export const useScratchSaveState = ({
  enabled = false,
  autoSaveEnabled = false,
} = {}) => {
  const dispatch = useDispatch();

  // --- Context (read by scratchSaveLifecycle) ---
  const contextRef = useRef(null);
  const autoSaveEnabledRef = useRef(false);
  const enabledRef = useRef(false);

  // --- Queue + in-flight ---
  const schedulerRef = useRef({
    queued: false,
    inFlight: false,
    lastCompletedAt: null,
  });
  const inFlightSavePromiseRef = useRef(null);
  const inFlightSaveResolveRef = useRef(null);
  const inFlightSaveRejectRef = useRef(null);
  const currentSaveIsAutosaveRef = useRef(false);

  // --- Throttle + debounce ---
  const throttleTimerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const projectChangedAtRef = useRef(null);
  const projectDirtyRef = useRef(false);

  contextRef.current = {
    canAutoSave: () => enabledRef.current && autoSaveEnabledRef.current,
    hasProjectChanged: () => projectDirtyRef.current,
    getProjectChangedAt: () => projectChangedAtRef.current,
    clearDirty: () => {
      projectDirtyRef.current = false;
    },
  };

  // --- Lifecycle (queue + throttle + debounce + navigation flush callbacks) ---
  const lifecycleRef = useRef(null);
  if (!lifecycleRef.current) {
    lifecycleRef.current = createScratchSaveLifecycle({
      getContext: () => contextRef.current,
      getScheduler: () => schedulerRef.current,
      postSave: () => {
        postMessageToScratchIframe({ type: "scratch-gui-save" });
      },
      inFlightSavePromiseRef,
      inFlightSaveResolveRef,
      inFlightSaveRejectRef,
      currentSaveIsAutosaveRef,
      throttleTimerRef,
      autoSaveTimeoutRef,
    });
  }

  const lifecycle = lifecycleRef.current;

  const onProjectChanged = useEffectEvent(() => {
    projectDirtyRef.current = true;
    projectChangedAtRef.current = Date.now();
    lifecycle.onProjectChanged();
  });

  const flushQueuedSave = useEffectEvent(() => lifecycle.flushQueuedSave());
  const flushPendingAutoSave = useEffectEvent(() =>
    lifecycle.flushPendingAutoSave(),
  );
  const hasPendingAutoSave = useEffectEvent(() =>
    lifecycle.hasPendingAutoSave(),
  );
  const shouldFlushBeforeNavigation = useEffectEvent(() =>
    lifecycle.shouldFlushBeforeNavigation(),
  );

  const navigationFlushEnabled = Boolean(enabled && autoSaveEnabled);

  useEffect(() => {
    enabledRef.current = enabled;
    autoSaveEnabledRef.current = Boolean(enabled && autoSaveEnabled);

    if (!autoSaveEnabledRef.current) {
      lifecycle.cancelPendingWork();
    }
  }, [autoSaveEnabled, enabled, lifecycle]);

  useScratchSaveNavigationFlush({
    enabled: navigationFlushEnabled,
    clearAutoSaveTimeout: () => lifecycle.clearAutoSaveTimeout(),
    clearThrottleTimer: () => lifecycle.clearThrottleTimer(),
    hasPendingAutoSave,
    flushPendingAutoSave,
    shouldFlushBeforeNavigation,
  });

  // --- Iframe transport (messages in, postMessage out) ---
  useEffect(() => {
    if (!enabled) {
      lifecycle.cancelInFlightSave();
      lifecycle.clearAutoSaveTimeout();
      lifecycle.clearThrottleTimer();
      return undefined;
    }

    const allowedOrigin = getScratchAllowedOrigin();
    const handleScratchMessage = (event) => {
      if (event.origin !== allowedOrigin) {
        return;
      }

      switch (event.data?.type) {
        case "scratch-gui-project-changed":
          if (!autoSaveEnabledRef.current) {
            break;
          }
          onProjectChanged();
          break;
        case "scratch-gui-saving-started":
        case "scratch-gui-remixing-started":
          schedulerRef.current.inFlight = true;
          dispatch(scratchSaveStarted());
          break;
        case "scratch-gui-saving-succeeded":
          dispatch(
            scratchSaveSucceeded({
              autosave: currentSaveIsAutosaveRef.current,
            }),
          );
          lifecycle.markSaveSucceeded(currentSaveIsAutosaveRef.current);
          break;
        case "scratch-gui-remixing-succeeded":
          dispatch(scratchSaveSucceeded({ autosave: false }));
          lifecycle.markSaveSucceeded(false);
          break;
        case "scratch-gui-saving-failed":
        case "scratch-gui-remixing-failed":
          lifecycle.clearAutoSaveTimeout();
          lifecycle.resetSaveTracking();
          dispatch(scratchSaveFailed());
          flushQueuedSave();
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handleScratchMessage);

    return () => {
      window.removeEventListener("message", handleScratchMessage);
    };
    // Omit autosave helpers from deps — useEffectEvent/refs; re-bind listener only when enabled changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, enabled, lifecycle]);

  const saveScratchProject = useCallback(
    ({ shouldRemixOnSave = false } = {}) => {
      lifecycle.clearAutoSaveTimeout();
      lifecycle.clearThrottleTimer();
      lifecycle.clearQueue();
      currentSaveIsAutosaveRef.current = false;
      if (shouldRemixOnSave) {
        postMessageToScratchIframe({
          type: "scratch-gui-remix",
        });
        return;
      }

      projectDirtyRef.current = true;
      lifecycle.postSaveRequest({ autosave: false });
    },
    [lifecycle],
  );

  return {
    saveScratchProject,
  };
};
