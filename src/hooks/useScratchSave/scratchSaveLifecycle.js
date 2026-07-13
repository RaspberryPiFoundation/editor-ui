import {
  AUTOSAVE_COOLDOWN_MS,
  AUTOSAVE_DEBOUNCE_MS,
  clearTimerRef,
  getRemainingCooldownMs,
  getRemainingDebounceMs,
  hasOutstandingAutosaveWork,
  isInAutosaveCooldown,
} from "../../utils/save/autoSaveScheduling";

/**
 * Scratch autosave lifecycle: debounce → queue → in-flight iframe save → cooldown.
 *
 * Transport (postMessage + message handler) stays in useScratchSaveState; this module
 * owns scheduling only. Mirrors createAutoSaveLifecycle for Python/HTML.
 *
 * requestAutoSave: debounced entry after scratch-gui-project-changed.
 * flushQueuedSave: drains the queue when in-flight/cooldown allows.
 * flushPendingAutoSave: force-save for SPA navigation; bypasses cooldown (awaitable).
 */
export const createScratchSaveLifecycle = ({
  getContext,
  getScheduler,
  postSave,
  inFlightSavePromiseRef,
  inFlightSaveResolveRef,
  inFlightSaveRejectRef,
  currentSaveIsAutosaveRef,
  cooldownTimerRef,
  autoSaveTimeoutRef,
}) => {
  const canAutoSave = () => getContext().canAutoSave();
  const hasProjectChanged = () => getContext().hasProjectChanged();
  const getProjectChangedAt = () => getContext().getProjectChangedAt();

  const isSaveInFlight = () => getScheduler().inFlight;

  const clearQueue = () => {
    getScheduler().queued = false;
  };

  const clearQueueIfUnchanged = () => {
    if (!hasProjectChanged()) {
      clearQueue();
      return true;
    }

    return false;
  };

  const getRemainingAutoSaveCooldownMs = () =>
    getRemainingCooldownMs(
      getScheduler().lastCompletedAt,
      AUTOSAVE_COOLDOWN_MS,
    );

  const clearAutoSaveTimeout = () => clearTimerRef(autoSaveTimeoutRef);

  const clearCooldownTimer = () => clearTimerRef(cooldownTimerRef);

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

  const postSaveRequest = ({ autosave }) => {
    currentSaveIsAutosaveRef.current = autosave;
    getScheduler().inFlight = true;

    const savePromise = new Promise((resolve, reject) => {
      inFlightSaveResolveRef.current = resolve;
      inFlightSaveRejectRef.current = reject;
    });
    inFlightSavePromiseRef.current = savePromise;

    postSave({ autosave });

    return savePromise;
  };

  const startAutoSave = ({ autosave = true } = {}) =>
    postSaveRequest({ autosave }).catch((error) => {
      getScheduler().queued = true;
      throw error;
    });

  const scheduleCooldownFlush = () => {
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
  };

  const requestAutoSave = (delay = AUTOSAVE_DEBOUNCE_MS) => {
    if (autoSaveTimeoutRef.current) {
      return;
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveTimeoutRef.current = null;

      if (!canAutoSave()) {
        return;
      }

      if (isSaveInFlight()) {
        getScheduler().queued = true;
        return;
      }

      if (isInAutosaveCooldown(getScheduler().lastCompletedAt)) {
        getScheduler().queued = true;
        scheduleCooldownFlush();
        return;
      }

      clearQueue();
      startAutoSave({ autosave: true }).catch(() => {});
    }, delay);
  };

  const flushQueuedSave = () => {
    if (!getScheduler().queued) {
      return;
    }

    if (!canAutoSave() || !hasProjectChanged()) {
      clearQueue();
      return;
    }

    if (isSaveInFlight()) {
      return;
    }

    if (isInAutosaveCooldown(getScheduler().lastCompletedAt)) {
      scheduleCooldownFlush();
      return;
    }

    clearQueue();

    const remainingDebounceTime = getRemainingDebounceMs(
      getProjectChangedAt(),
      AUTOSAVE_DEBOUNCE_MS,
    );

    requestAutoSave(remainingDebounceTime);
  };

  const onProjectChanged = () => {
    if (!canAutoSave()) {
      return;
    }

    if (isSaveInFlight()) {
      getScheduler().queued = true;
      return;
    }

    if (isInAutosaveCooldown(getScheduler().lastCompletedAt)) {
      getScheduler().queued = true;
      scheduleCooldownFlush();
      return;
    }

    requestAutoSave();
  };

  const hasPendingAutoSave = () => {
    if (!canAutoSave()) {
      return false;
    }

    const scheduler = getScheduler();

    return (
      hasProjectChanged() &&
      hasOutstandingAutosaveWork({
        queued: scheduler.queued,
        inFlight: scheduler.inFlight,
        lastCompletedAt: scheduler.lastCompletedAt,
      })
    );
  };

  const shouldFlushBeforeNavigation = () =>
    canAutoSave() && hasProjectChanged();

  const flushPendingAutoSave = async () => {
    if (!canAutoSave()) {
      return;
    }

    await waitForInFlightSave();
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearCooldownTimer();
    clearAutoSaveTimeout();

    if (getScheduler().inFlight) {
      await waitForInFlightSave();
    }
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearQueue();
    return startAutoSave({ autosave: true });
  };

  const markSaveSucceeded = (autosave) => {
    getScheduler().inFlight = false;
    if (!getScheduler().queued) {
      getContext().clearDirty?.();
    }
    if (autosave) {
      getScheduler().lastCompletedAt = Date.now();
    }
    resolveInFlightSave();
    currentSaveIsAutosaveRef.current = false;
    flushQueuedSave();
  };

  const resetSaveTracking = () => {
    getScheduler().inFlight = false;
    currentSaveIsAutosaveRef.current = false;
    if (inFlightSavePromiseRef.current) {
      rejectInFlightSave(new Error("scratch autosave failed"));
    }
  };

  const cancelPendingWork = () => {
    clearAutoSaveTimeout();
    clearCooldownTimer();
    clearQueue();
    getContext().clearDirty?.();
  };

  const cancelInFlightSave = () => {
    getScheduler().inFlight = false;
    currentSaveIsAutosaveRef.current = false;
    if (inFlightSavePromiseRef.current) {
      rejectInFlightSave(new Error("scratch autosave cancelled"));
    }
  };

  return {
    requestAutoSave,
    onProjectChanged,
    flushQueuedSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
    clearAutoSaveTimeout,
    clearCooldownTimer,
    clearQueue,
    postSaveRequest,
    markSaveSucceeded,
    resetSaveTracking,
    cancelPendingWork,
    cancelInFlightSave,
  };
};
