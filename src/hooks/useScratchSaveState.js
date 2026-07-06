import { useCallback, useEffect, useRef } from "react";
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
  clearScratchAutoSaveHostApi,
  registerScratchAutoSaveHostApi,
} from "../utils/ownerAutoSaveHostApi";

const SCRATCH_AUTOSAVE_DELAY_MS = 2000;
const SCRATCH_AUTOSAVE_COOLDOWN_MS = 10000;

export const useScratchSaveState = ({
  enabled = false,
  autoSaveEnabled = false,
} = {}) => {
  const dispatch = useDispatch();
  const autoSaveTimeoutRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const inFlightSavePromiseRef = useRef(null);
  const inFlightSaveResolveRef = useRef(null);
  const inFlightSaveRejectRef = useRef(null);
  const currentSaveIsAutosaveRef = useRef(false);
  const autoSaveEnabledRef = useRef(false);
  const enabledRef = useRef(false);
  const autoSaveQueuedAfterSaveRef = useRef(false);
  const projectChangedAtRef = useRef(null);
  const projectDirtyRef = useRef(false);
  const scratchRunInProgressRef = useRef(false);
  const lastAutoSaveCompletedAtRef = useRef(null);

  const getRemainingAutoSaveCooldownMs = () => {
    if (lastAutoSaveCompletedAtRef.current == null) {
      return 0;
    }

    return Math.max(
      0,
      lastAutoSaveCompletedAtRef.current +
        SCRATCH_AUTOSAVE_COOLDOWN_MS -
        Date.now(),
    );
  };

  const clearAutoSaveTimeout = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  }, []);

  const clearCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const resolveInFlightSave = useCallback(() => {
    inFlightSaveResolveRef.current?.();
    inFlightSavePromiseRef.current = null;
    inFlightSaveResolveRef.current = null;
    inFlightSaveRejectRef.current = null;
  }, []);

  const rejectInFlightSave = useCallback((error) => {
    inFlightSaveRejectRef.current?.(error);
    inFlightSavePromiseRef.current = null;
    inFlightSaveResolveRef.current = null;
    inFlightSaveRejectRef.current = null;
  }, []);

  const postSaveRequest = useCallback(({ autosave }) => {
    currentSaveIsAutosaveRef.current = autosave;
    saveInFlightRef.current = true;

    const savePromise = new Promise((resolve, reject) => {
      inFlightSaveResolveRef.current = resolve;
      inFlightSaveRejectRef.current = reject;
    });
    inFlightSavePromiseRef.current = savePromise;

    postMessageToScratchIframe({
      type: "scratch-gui-save",
    });

    return savePromise;
  }, []);

  const startScratchAutoSave = useCallback(
    ({ autosave = true } = {}) => {
      return postSaveRequest({ autosave }).catch((error) => {
        autoSaveQueuedAfterSaveRef.current = true;
        throw error;
      });
    },
    [postSaveRequest],
  );

  const scheduleAutoSave = useCallback(
    (delay = SCRATCH_AUTOSAVE_DELAY_MS) => {
      if (autoSaveTimeoutRef.current) {
        return;
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveTimeoutRef.current = null;

        if (!autoSaveEnabledRef.current) {
          return;
        }

        if (scratchRunInProgressRef.current) {
          autoSaveQueuedAfterSaveRef.current = true;
          return;
        }

        if (saveInFlightRef.current) {
          autoSaveQueuedAfterSaveRef.current = true;
          return;
        }

        if (getRemainingAutoSaveCooldownMs() > 0) {
          autoSaveQueuedAfterSaveRef.current = true;
          scheduleCooldownFlushRef.current();
          return;
        }

        autoSaveQueuedAfterSaveRef.current = false;
        startScratchAutoSave({ autosave: true }).catch(() => {});
      }, delay);
    },
    [startScratchAutoSave],
  );

  const scheduleQueuedAutoSave = useCallback(() => {
    if (!autoSaveQueuedAfterSaveRef.current) {
      return;
    }

    if (!autoSaveEnabledRef.current || !projectDirtyRef.current) {
      autoSaveQueuedAfterSaveRef.current = false;
      return;
    }

    if (scratchRunInProgressRef.current || saveInFlightRef.current) {
      return;
    }

    if (getRemainingAutoSaveCooldownMs() > 0) {
      scheduleCooldownFlushRef.current();
      return;
    }

    autoSaveQueuedAfterSaveRef.current = false;

    const lastChangedAt = projectChangedAtRef.current;
    const remainingDebounceTime =
      lastChangedAt == null
        ? 0
        : Math.max(0, lastChangedAt + SCRATCH_AUTOSAVE_DELAY_MS - Date.now());

    scheduleAutoSave(remainingDebounceTime);
  }, [scheduleAutoSave]);

  const scheduleCooldownFlush = useCallback(() => {
    const remainingCooldown = getRemainingAutoSaveCooldownMs();
    if (remainingCooldown <= 0) {
      scheduleQueuedAutoSave();
      return;
    }

    if (cooldownTimerRef.current) {
      return;
    }

    cooldownTimerRef.current = setTimeout(() => {
      cooldownTimerRef.current = null;
      scheduleQueuedAutoSave();
    }, remainingCooldown);
  }, [scheduleQueuedAutoSave]);

  const scheduleCooldownFlushRef = useRef(scheduleCooldownFlush);
  scheduleCooldownFlushRef.current = scheduleCooldownFlush;

  const scheduleQueuedAutoSaveRef = useRef(scheduleQueuedAutoSave);
  scheduleQueuedAutoSaveRef.current = scheduleQueuedAutoSave;

  const waitForInFlightSave = useCallback(async () => {
    if (inFlightSavePromiseRef.current) {
      await inFlightSavePromiseRef.current;
    }
  }, []);

  const hasPendingScratchAutoSave = useCallback(() => {
    if (!enabledRef.current || !autoSaveEnabledRef.current) {
      return false;
    }

    return (
      projectDirtyRef.current &&
      (autoSaveQueuedAfterSaveRef.current ||
        saveInFlightRef.current ||
        getRemainingAutoSaveCooldownMs() > 0)
    );
  }, []);

  const shouldFlushBeforeNavigation = useCallback(() => {
    return (
      enabledRef.current &&
      autoSaveEnabledRef.current &&
      projectDirtyRef.current
    );
  }, []);

  const flushPendingScratchAutoSave = useCallback(async () => {
    if (!enabledRef.current || !autoSaveEnabledRef.current) {
      return;
    }

    await waitForInFlightSave();

    if (!projectDirtyRef.current) {
      autoSaveQueuedAfterSaveRef.current = false;
      return;
    }

    clearCooldownTimer();
    clearAutoSaveTimeout();

    if (saveInFlightRef.current) {
      await waitForInFlightSave();
    }

    if (!projectDirtyRef.current) {
      autoSaveQueuedAfterSaveRef.current = false;
      return;
    }

    autoSaveQueuedAfterSaveRef.current = false;
    return startScratchAutoSave({ autosave: true });
  }, [
    clearAutoSaveTimeout,
    clearCooldownTimer,
    startScratchAutoSave,
    waitForInFlightSave,
  ]);

  const hasPendingScratchAutoSaveRef = useRef(hasPendingScratchAutoSave);
  hasPendingScratchAutoSaveRef.current = hasPendingScratchAutoSave;

  const shouldFlushBeforeNavigationRef = useRef(shouldFlushBeforeNavigation);
  shouldFlushBeforeNavigationRef.current = shouldFlushBeforeNavigation;

  const flushPendingScratchAutoSaveRef = useRef(flushPendingScratchAutoSave);
  flushPendingScratchAutoSaveRef.current = flushPendingScratchAutoSave;

  useEffect(() => {
    enabledRef.current = enabled;
    autoSaveEnabledRef.current = Boolean(enabled && autoSaveEnabled);

    if (!autoSaveEnabledRef.current) {
      clearAutoSaveTimeout();
      clearCooldownTimer();
      autoSaveQueuedAfterSaveRef.current = false;
    }
  }, [autoSaveEnabled, clearAutoSaveTimeout, clearCooldownTimer, enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    registerScratchAutoSaveHostApi({
      hasPendingAutoSave: () => hasPendingScratchAutoSaveRef.current(),
      flushPendingAutoSave: () => flushPendingScratchAutoSaveRef.current(),
      shouldFlushBeforeNavigation: () =>
        shouldFlushBeforeNavigationRef.current(),
    });

    return () => {
      clearScratchAutoSaveHostApi();
    };
  }, [enabled]);

  useEffect(() => {
    const resetScratchSaveTracking = () => {
      saveInFlightRef.current = false;
      currentSaveIsAutosaveRef.current = false;
      if (inFlightSavePromiseRef.current) {
        rejectInFlightSave(new Error("scratch autosave failed"));
      }
    };

    const markScratchSaveSucceeded = (autosave) => {
      saveInFlightRef.current = false;
      if (!autoSaveQueuedAfterSaveRef.current) {
        projectDirtyRef.current = false;
      }
      if (autosave) {
        lastAutoSaveCompletedAtRef.current = Date.now();
      }
      resolveInFlightSave();
      currentSaveIsAutosaveRef.current = false;
      scheduleQueuedAutoSaveRef.current();
    };

    if (!enabled) {
      saveInFlightRef.current = false;
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
          if (scratchRunInProgressRef.current || saveInFlightRef.current) {
            autoSaveQueuedAfterSaveRef.current = true;
            break;
          }
          if (getRemainingAutoSaveCooldownMs() > 0) {
            autoSaveQueuedAfterSaveRef.current = true;
            scheduleCooldownFlushRef.current();
            break;
          }
          scheduleAutoSave();
          break;
        case "scratch-gui-project-run-started":
          scratchRunInProgressRef.current = true;
          break;
        case "scratch-gui-project-run-stopped":
          scratchRunInProgressRef.current = false;
          scheduleQueuedAutoSaveRef.current();
          break;
        case "scratch-gui-saving-started":
        case "scratch-gui-remixing-started":
          saveInFlightRef.current = true;
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
          scheduleQueuedAutoSaveRef.current();
          break;
        default:
          break;
      }
    };

    const handlePageHide = () => {
      flushPendingScratchAutoSaveRef.current();
    };

    const handleBeforeUnload = (event) => {
      if (!hasPendingScratchAutoSaveRef.current()) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("message", handleScratchMessage);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("message", handleScratchMessage);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearAutoSaveTimeout();
      clearCooldownTimer();
      flushPendingScratchAutoSaveRef.current();
    };
  }, [
    clearAutoSaveTimeout,
    clearCooldownTimer,
    dispatch,
    enabled,
    rejectInFlightSave,
    resolveInFlightSave,
    scheduleAutoSave,
  ]);

  const saveScratchProject = useCallback(
    ({ shouldRemixOnSave = false } = {}) => {
      clearAutoSaveTimeout();
      clearCooldownTimer();
      autoSaveQueuedAfterSaveRef.current = false;
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
    [clearAutoSaveTimeout, clearCooldownTimer, postSaveRequest],
  );

  return {
    saveScratchProject,
  };
};
