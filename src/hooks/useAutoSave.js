import { useEffect, useEffectEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { expireJustLoaded, syncProject } from "../redux/EditorSlice";
import {
  AUTOSAVE_COOLDOWN_MS,
  clearTimerRef,
  getAutosaveDebounceMs,
  getRemainingCooldownMs,
  hasOutstandingAutosaveWork,
  isInAutosaveCooldown,
} from "../utils/autoSaveScheduling";
import {
  clearAutoSaveHostApi,
  registerAutoSaveHostApi,
} from "../utils/autoSaveHostApi";
import {
  hasProjectChangedForAutoSave,
  isAutoSaveBlocked,
  isEligibleForAutoSave,
} from "../utils/autoSaveLogic";

/**
 * Python/HTML API autosave (not Scratch — see useScratchSaveState).
 *
 * Active when enabled is true (set from useProjectPersistence via isEligibleForAutoSave).
 *
 * - Logged in as author, saved project (identifier exists) — debounced save to the API.
 *
 * When enabled is false, useLocalProjectBackup handles localStorage instead.
 * The two hooks never overlap on the same edit.
 *
 * Pipeline: project change → debounce → requestAutoSave → cooldown/queue → API save
 *
 * - requestAutoSave: tries to save immediately, or queues when blocked/in cooldown.
 * - flushQueuedSave: drains the queue when run/save/cooldown allows (e.g. after run ends).
 * - flushPendingAutoSave: force-save for navigation/pagehide; bypasses cooldown, waits for
 *   in-flight saves first.
 *
 * Blocked when: code is running, autosave in flight, or any Redux save is pending.
 *
 * hasPendingAutoSave: queued | inFlight | in cooldown (for "work still outstanding").
 * shouldFlushBeforeNavigation: project dirty only (navigation must save even during cooldown).
 */
export const useAutoSave = ({
  user,
  project,
  reactAppApiEndpoint,
  justLoaded = false,
  enabled: enabledProp,
}) => {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.editor.saving);
  const codeRunInProgress = useSelector(
    (state) => state.editor.codeRunInProgress,
  );
  const initialComponents = useSelector(
    (state) => state.editor.initialComponents,
  );
  const initialProjectName = useSelector(
    (state) => state.editor.initialProjectName,
  );
  const initialProjectInstructions = useSelector(
    (state) => state.editor.initialProjectInstructions,
  );

  const schedulerRef = useRef({
    queued: false,
    inFlight: false,
    lastCompletedAt: null,
  });
  const inFlightSavePromiseRef = useRef(null);
  const pendingSaveWaitersRef = useRef([]);
  const cooldownTimerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const justLoadedRef = useRef(justLoaded);
  const savingRef = useRef(saving);
  const codeRunInProgressRef = useRef(codeRunInProgress);
  const projectRef = useRef(project);
  const userRef = useRef(user);
  const initialComponentsRef = useRef(initialComponents);
  const initialProjectNameRef = useRef(initialProjectName);
  const initialProjectInstructionsRef = useRef(initialProjectInstructions);
  const prevCodeRunInProgressRef = useRef(codeRunInProgress);

  const enabled = enabledProp ?? isEligibleForAutoSave(user, project);
  const enabledRef = useRef(enabled);

  // Keep latest Redux/props in refs for useEffectEvent handlers (async-safe, no stale closures).
  savingRef.current = saving;
  codeRunInProgressRef.current = codeRunInProgress;
  projectRef.current = project;
  userRef.current = user;
  initialComponentsRef.current = initialComponents;
  initialProjectNameRef.current = initialProjectName;
  initialProjectInstructionsRef.current = initialProjectInstructions;
  justLoadedRef.current = justLoaded;
  enabledRef.current = enabled;

  const editDebounceMs = getAutosaveDebounceMs(project);

  const isEligible = () => enabledRef.current;

  const isSaveBlocked = () =>
    isAutoSaveBlocked({
      codeRunInProgress: codeRunInProgressRef.current,
      inFlight: schedulerRef.current.inFlight,
      saving: savingRef.current,
    });

  const getRemainingAutoSaveCooldownMs = () =>
    getRemainingCooldownMs(
      schedulerRef.current.lastCompletedAt,
      AUTOSAVE_COOLDOWN_MS,
    );

  const clearCooldownTimer = () => clearTimerRef(cooldownTimerRef);

  const hasProjectChanged = () =>
    hasProjectChangedForAutoSave(
      projectRef.current,
      initialComponentsRef.current,
      {
        initialName: initialProjectNameRef.current,
        initialInstructions: initialProjectInstructionsRef.current,
      },
    );

  const clearQueue = () => {
    schedulerRef.current.queued = false;
  };

  const clearQueueIfUnchanged = () => {
    if (!hasProjectChanged()) {
      clearQueue();
      return true;
    }

    return false;
  };

  const waitForPendingSave = () => {
    if (savingRef.current !== "pending") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      pendingSaveWaitersRef.current.push(resolve);
    });
  };

  const waitForInFlightSave = async () => {
    if (inFlightSavePromiseRef.current) {
      await inFlightSavePromiseRef.current;
    }

    if (savingRef.current === "pending") {
      await waitForPendingSave();
    }
  };

  const flushQueuedSave = useEffectEvent(() => {
    if (!schedulerRef.current.queued || !hasProjectChanged()) {
      clearQueue();
      return;
    }

    if (isSaveBlocked()) {
      return;
    }

    if (isInAutosaveCooldown(schedulerRef.current.lastCompletedAt)) {
      scheduleCooldownFlush();
      return;
    }

    clearQueue();
    startAutoSave().catch(() => {});
  });

  const scheduleCooldownFlush = useEffectEvent(() => {
    const remainingCooldown = getRemainingAutoSaveCooldownMs();
    if (remainingCooldown <= 0) {
      flushQueuedSave();
      return;
    }

    if (cooldownTimerRef.current) {
      return;
    }

    cooldownTimerRef.current = setTimeout(() => {
      cooldownTimerRef.current = null;
      flushQueuedSave();
    }, remainingCooldown);
  });

  const startAutoSave = useEffectEvent(() => {
    schedulerRef.current.inFlight = true;

    const savePromise = Promise.resolve(
      dispatch(
        syncProject("save")({
          reactAppApiEndpoint,
          project: projectRef.current,
          accessToken: userRef.current.access_token,
          autosave: true,
        }),
      ),
    )
      .then(() => {
        schedulerRef.current.lastCompletedAt = Date.now();
      })
      .catch(() => {
        schedulerRef.current.queued = true;
        throw new Error("autosave failed");
      })
      .finally(() => {
        schedulerRef.current.inFlight = false;
        inFlightSavePromiseRef.current = null;
        flushQueuedSave();
      });

    inFlightSavePromiseRef.current = savePromise;
    return savePromise;
  });

  const hasPendingAutoSave = useEffectEvent(() => {
    return (
      isEligible() &&
      hasProjectChanged() &&
      hasOutstandingAutosaveWork({
        queued: schedulerRef.current.queued,
        inFlight: schedulerRef.current.inFlight,
        lastCompletedAt: schedulerRef.current.lastCompletedAt,
      })
    );
  });

  const shouldFlushBeforeNavigation = useEffectEvent(() => {
    return isEligible() && hasProjectChanged();
  });

  const requestAutoSave = useEffectEvent(() => {
    if (!isEligible()) {
      return;
    }

    if (!hasProjectChanged()) {
      return;
    }

    if (isSaveBlocked()) {
      schedulerRef.current.queued = true;
      return;
    }

    if (isInAutosaveCooldown(schedulerRef.current.lastCompletedAt)) {
      schedulerRef.current.queued = true;
      scheduleCooldownFlush();
      return;
    }

    clearQueue();
    startAutoSave().catch(() => {});
  });

  const flushPendingAutoSave = useEffectEvent(async () => {
    if (!isEligible()) {
      return;
    }

    await waitForInFlightSave();
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearCooldownTimer();

    if (schedulerRef.current.inFlight || savingRef.current === "pending") {
      await waitForInFlightSave();
    }
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearQueue();
    return startAutoSave();
  });

  // Resume flush waiters when a Redux save (manual or autosave) leaves pending.
  useEffect(() => {
    if (saving !== "pending") {
      const waiters = pendingSaveWaitersRef.current;
      pendingSaveWaitersRef.current = [];
      waiters.forEach((resolve) => resolve());
    }
  }, [saving]);

  // Register host API and page lifecycle handlers when autosave is enabled.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    registerAutoSaveHostApi({
      hasPendingAutoSave,
      flushPendingAutoSave,
      shouldFlushBeforeNavigation,
    });

    const handlePageHide = () => {
      flushPendingAutoSave();
    };

    const handleBeforeUnload = (event) => {
      if (!shouldFlushBeforeNavigation()) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearCooldownTimer();
      flushPendingAutoSave();
      clearAutoSaveHostApi();
    };
    // useEffectEvent callbacks are stable and always invoke the latest logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Retry queued autosave when a Python code run finishes.
  useEffect(() => {
    const wasInProgress = prevCodeRunInProgressRef.current;
    prevCodeRunInProgressRef.current = codeRunInProgress;

    if (wasInProgress && !codeRunInProgress && enabled) {
      flushQueuedSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRunInProgress, enabled]);

  // Debounce edits, then attempt API autosave.
  useEffect(() => {
    clearTimerRef(debounceTimerRef);

    if (!enabled) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;

      if (justLoadedRef.current) {
        dispatch(expireJustLoaded());
      }

      requestAutoSave();
    }, editDebounceMs);

    return () => clearTimerRef(debounceTimerRef);
  }, [dispatch, editDebounceMs, enabled, project, user]); // eslint-disable-line react-hooks/exhaustive-deps
  // justLoaded is read via ref so expireJustLoaded is not fired too early.

  return {
    requestAutoSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
  };
};
