import { useCallback, useEffect, useEffectEvent, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getScratchAllowedOrigin,
  postMessageToScratchIframe,
} from "../utils/scratchIframe";
import {
  scratchSaveFailed,
  scratchSaveStarted,
  scratchSaveSucceeded,
} from "../redux/EditorSlice";
import {
  AUTOSAVE_COOLDOWN_MS,
  clearTimerRef,
  getRemainingCooldownMs,
  getRemainingDebounceMs,
  hasOutstandingAutosaveWork,
  isInAutosaveCooldown,
} from "../utils/autoSaveScheduling";
import {
  clearScratchAutoSaveHostApi,
  registerScratchAutoSaveHostApi,
} from "../utils/ownerAutoSaveHostApi";

const SCRATCH_AUTOSAVE_DELAY_MS = 2000;

/**
 * Scratch autosave state machine:
 *
 * - requestAutoSave: debounced autosave after project-changed, or queue when blocked/in cooldown.
 * - flushQueuedSave: drains the queue when run/save/cooldown allows (may re-enter debounce).
 * - flushPendingAutoSave: force-save for navigation/pagehide; bypasses cooldown, waits for
 *   in-flight saves first.
 *
 * Blocked when: Scratch run in progress or a save is already in flight.
 *
 * hasPendingAutoSave: dirty and (queued | inFlight | in cooldown).
 * shouldFlushBeforeNavigation: dirty only (navigation must save even during cooldown).
 */
export const useScratchSaveState = ({
  enabled = false,
  autoSaveEnabled = false,
} = {}) => {
  const dispatch = useDispatch();
  const schedulerRef = useRef({
    queued: false,
    inFlight: false,
    lastCompletedAt: null,
  });
  const autoSaveTimeoutRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const inFlightSavePromiseRef = useRef(null);
  const inFlightSaveResolveRef = useRef(null);
  const inFlightSaveRejectRef = useRef(null);
  const currentSaveIsAutosaveRef = useRef(false);
  const autoSaveEnabledRef = useRef(false);
  const enabledRef = useRef(false);
  const projectChangedAtRef = useRef(null);
  const projectDirtyRef = useRef(false);
  const scratchRunInProgressRef = useRef(false);

  const isEligibleForAutoSave = () =>
    enabledRef.current && autoSaveEnabledRef.current;

  const isSaveBlocked = () =>
    scratchRunInProgressRef.current || schedulerRef.current.inFlight;

  const hasProjectChanged = () => projectDirtyRef.current;

  const getRemainingAutoSaveCooldownMs = () =>
    getRemainingCooldownMs(
      schedulerRef.current.lastCompletedAt,
      AUTOSAVE_COOLDOWN_MS,
    );

  const clearAutoSaveTimeout = () => clearTimerRef(autoSaveTimeoutRef);

  const clearCooldownTimer = () => clearTimerRef(cooldownTimerRef);

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

  const resolveInFlightSave = () => {
    inFlightSaveResolveRef.current?.();
    inFlightSavePromiseRef.current = null;
    inFlightSaveResolveRef.current = null;
    inFlightSaveRejectRef.current = null;
  };

  const rejectInFlightSave = (error) => {
    inFlightSaveRejectRef.current?.(error);
    inFlightSavePromiseRef.current = null;
    inFlightSaveResolveRef.current = null;
    inFlightSaveRejectRef.current = null;
  };

  const waitForInFlightSave = async () => {
    if (inFlightSavePromiseRef.current) {
      await inFlightSavePromiseRef.current;
    }
  };

  const postSaveRequest = useEffectEvent(({ autosave }) => {
    currentSaveIsAutosaveRef.current = autosave;
    schedulerRef.current.inFlight = true;

    const savePromise = new Promise((resolve, reject) => {
      inFlightSaveResolveRef.current = resolve;
      inFlightSaveRejectRef.current = reject;
    });
    inFlightSavePromiseRef.current = savePromise;

    postMessageToScratchIframe({
      type: "scratch-gui-save",
    });

    return savePromise;
  });

  const startAutoSave = useEffectEvent(({ autosave = true } = {}) => {
    return postSaveRequest({ autosave }).catch((error) => {
      schedulerRef.current.queued = true;
      throw error;
    });
  });

  const requestAutoSave = useEffectEvent(
    (delay = SCRATCH_AUTOSAVE_DELAY_MS) => {
      if (autoSaveTimeoutRef.current) {
        return;
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveTimeoutRef.current = null;

        if (!isEligibleForAutoSave()) {
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
        startAutoSave({ autosave: true }).catch(() => {});
      }, delay);
    },
  );

  const flushQueuedSave = useEffectEvent(() => {
    if (!schedulerRef.current.queued) {
      return;
    }

    if (!isEligibleForAutoSave() || !hasProjectChanged()) {
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

    const remainingDebounceTime = getRemainingDebounceMs(
      projectChangedAtRef.current,
      SCRATCH_AUTOSAVE_DELAY_MS,
    );

    requestAutoSave(remainingDebounceTime);
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

  const hasPendingAutoSave = useEffectEvent(() => {
    if (!isEligibleForAutoSave()) {
      return false;
    }

    return (
      hasProjectChanged() &&
      hasOutstandingAutosaveWork({
        queued: schedulerRef.current.queued,
        inFlight: schedulerRef.current.inFlight,
        lastCompletedAt: schedulerRef.current.lastCompletedAt,
      })
    );
  });

  const shouldFlushBeforeNavigation = useEffectEvent(() => {
    return isEligibleForAutoSave() && hasProjectChanged();
  });

  const flushPendingAutoSave = useEffectEvent(async () => {
    if (!isEligibleForAutoSave()) {
      return;
    }

    await waitForInFlightSave();
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearCooldownTimer();
    clearAutoSaveTimeout();

    if (schedulerRef.current.inFlight) {
      await waitForInFlightSave();
    }
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearQueue();
    return startAutoSave({ autosave: true });
  });

  useEffect(() => {
    enabledRef.current = enabled;
    autoSaveEnabledRef.current = Boolean(enabled && autoSaveEnabled);

    if (!autoSaveEnabledRef.current) {
      clearAutoSaveTimeout();
      clearCooldownTimer();
      clearQueue();
    }
  }, [autoSaveEnabled, enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    registerScratchAutoSaveHostApi({
      hasPendingAutoSave,
      flushPendingAutoSave,
      shouldFlushBeforeNavigation,
    });

    return () => {
      clearScratchAutoSaveHostApi();
    };
    // useEffectEvent callbacks are stable and always invoke the latest logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

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
      clearAutoSaveTimeout();
      flushPendingAutoSave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    const resetScratchSaveTracking = () => {
      schedulerRef.current.inFlight = false;
      currentSaveIsAutosaveRef.current = false;
      if (inFlightSavePromiseRef.current) {
        rejectInFlightSave(new Error("scratch autosave failed"));
      }
    };

    const markScratchSaveSucceeded = (autosave) => {
      schedulerRef.current.inFlight = false;
      if (!schedulerRef.current.queued) {
        projectDirtyRef.current = false;
      }
      if (autosave) {
        schedulerRef.current.lastCompletedAt = Date.now();
      }
      resolveInFlightSave();
      currentSaveIsAutosaveRef.current = false;
      flushQueuedSave();
    };

    if (!enabled) {
      schedulerRef.current.inFlight = false;
      currentSaveIsAutosaveRef.current = false;
      if (inFlightSavePromiseRef.current) {
        rejectInFlightSave(new Error("scratch autosave cancelled"));
      }
      clearAutoSaveTimeout();
      clearCooldownTimer();
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
          projectDirtyRef.current = true;
          projectChangedAtRef.current = Date.now();
          if (isSaveBlocked()) {
            schedulerRef.current.queued = true;
            break;
          }
          if (isInAutosaveCooldown(schedulerRef.current.lastCompletedAt)) {
            schedulerRef.current.queued = true;
            scheduleCooldownFlush();
            break;
          }
          requestAutoSave();
          break;
        case "scratch-gui-project-run-started":
          scratchRunInProgressRef.current = true;
          break;
        case "scratch-gui-project-run-stopped":
          scratchRunInProgressRef.current = false;
          flushQueuedSave();
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
          markScratchSaveSucceeded(currentSaveIsAutosaveRef.current);
          break;
        case "scratch-gui-remixing-succeeded":
          dispatch(scratchSaveSucceeded({ autosave: false }));
          markScratchSaveSucceeded(false);
          break;
        case "scratch-gui-saving-failed":
        case "scratch-gui-remixing-failed":
          clearAutoSaveTimeout();
          resetScratchSaveTracking();
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
    // useEffectEvent callbacks are stable and always invoke the latest logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, enabled]);

  const saveScratchProject = useCallback(
    ({ shouldRemixOnSave = false } = {}) => {
      clearAutoSaveTimeout();
      clearCooldownTimer();
      clearQueue();
      currentSaveIsAutosaveRef.current = false;
      if (shouldRemixOnSave) {
        postMessageToScratchIframe({
          type: "scratch-gui-remix",
        });
        return;
      }

      projectDirtyRef.current = true;
      postSaveRequest({ autosave: false });
    },
    // postSaveRequest is a useEffectEvent and is always current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    saveScratchProject,
  };
};
