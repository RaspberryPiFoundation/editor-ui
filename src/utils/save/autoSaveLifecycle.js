import { syncProject } from "../../redux/EditorSlice";
import {
  AUTOSAVE_THROTTLE_MS,
  clearTimerRef,
  getRemainingThrottleMs,
  hasOutstandingAutosaveWork,
  isInAutosaveThrottle,
} from "./autoSaveScheduling";
import {
  hasProjectChangedForAutoSave,
  isAutoSaveBlocked,
} from "./autoSaveLogic";

/**
 * Python/HTML autosave lifecycle: queue → in-flight save → throttle → flush.
 *
 * requestAutoSave: tries to save immediately, or queues when blocked/in throttle.
 * flushQueuedSave: drains the queue when run/save/throttle allows.
 * flushPendingAutoSave: force-save for navigation/pagehide; bypasses throttle.
 */
export const createAutoSaveLifecycle = ({
  dispatch,
  getContext,
  getScheduler,
  inFlightSavePromiseRef,
  pendingSaveWaitersRef,
  throttleTimerRef,
}) => {
  const isEnabled = () => getContext().enabled;

  const hasProjectChanged = () => {
    const {
      project,
      initialComponents,
      initialProjectName,
      initialProjectInstructions,
    } = getContext();

    return hasProjectChangedForAutoSave(project, initialComponents, {
      initialName: initialProjectName,
      initialInstructions: initialProjectInstructions,
    });
  };

  // --- Queue: edits while blocked, in-flight, or in throttle ---

  const isSaveBlocked = () => {
    const { codeRunInProgress, saving } = getContext();
    const scheduler = getScheduler();

    return isAutoSaveBlocked({
      codeRunInProgress,
      inFlight: scheduler.inFlight,
      saving,
    });
  };

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

  const enqueueSave = () => {
    getScheduler().queued = true;
  };

  // --- Throttle: 10s after a successful API save ---

  const getRemainingAutoSaveThrottleMs = () =>
    getRemainingThrottleMs(
      getScheduler().lastCompletedAt,
      AUTOSAVE_THROTTLE_MS,
    );

  const clearThrottleTimer = () => clearTimerRef(throttleTimerRef);

  const startThrottle = () => {
    getScheduler().lastCompletedAt = Date.now();
  };

  const deferUntilThrottleEnds = () => {
    enqueueSave();
    scheduleThrottleFlush();
  };

  // --- In-flight save: API call + Redux pending coordination ---

  const waitForPendingSave = () => {
    if (getContext().saving !== "pending") {
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

    if (getContext().saving === "pending") {
      await waitForPendingSave();
    }
  };

  const resolveSaveWaiters = () => {
    const waiters = pendingSaveWaitersRef.current;
    pendingSaveWaitersRef.current = [];
    waiters.forEach((resolve) => resolve());
  };

  const startAutoSave = () => {
    const scheduler = getScheduler();
    const { project, user, reactAppApiEndpoint } = getContext();
    scheduler.inFlight = true;

    const savePromise = Promise.resolve(
      dispatch(
        syncProject("save")({
          reactAppApiEndpoint,
          project,
          accessToken: user.access_token,
          autosave: true,
        }),
      ),
    )
      .then(() => {
        startThrottle();
      })
      .catch(() => {
        enqueueSave();
        throw new Error("autosave failed");
      })
      .finally(() => {
        getScheduler().inFlight = false;
        inFlightSavePromiseRef.current = null;
        flushQueuedSave();
      });

    inFlightSavePromiseRef.current = savePromise;
    return savePromise;
  };

  // --- Entry points ---

  const flushQueuedSave = () => {
    const scheduler = getScheduler();

    if (!scheduler.queued || !hasProjectChanged()) {
      clearQueue();
      return;
    }

    if (isSaveBlocked()) {
      return;
    }

    if (isInAutosaveThrottle(scheduler.lastCompletedAt)) {
      scheduleThrottleFlush();
      return;
    }

    clearQueue();
    startAutoSave().catch(() => {});
  };

  const scheduleThrottleFlush = () => {
    const remainingThrottle = getRemainingAutoSaveThrottleMs();
    if (remainingThrottle <= 0) {
      flushQueuedSave();
      return;
    }

    if (throttleTimerRef.current) {
      return;
    }

    throttleTimerRef.current = setTimeout(() => {
      throttleTimerRef.current = null;
      flushQueuedSave();
    }, remainingThrottle);
  };

  const requestAutoSave = () => {
    if (!isEnabled()) {
      return;
    }

    if (!hasProjectChanged()) {
      return;
    }

    if (isSaveBlocked()) {
      enqueueSave();
      return;
    }

    if (isInAutosaveThrottle(getScheduler().lastCompletedAt)) {
      deferUntilThrottleEnds();
      return;
    }

    clearQueue();
    startAutoSave().catch(() => {});
  };

  // --- Navigation flush: bypass throttle ---

  const hasPendingAutoSave = () => {
    const scheduler = getScheduler();

    return (
      isEnabled() &&
      hasProjectChanged() &&
      hasOutstandingAutosaveWork({
        queued: scheduler.queued,
        inFlight: scheduler.inFlight,
        lastCompletedAt: scheduler.lastCompletedAt,
      })
    );
  };

  const shouldFlushBeforeNavigation = () => isEnabled() && hasProjectChanged();

  const flushPendingAutoSave = async () => {
    if (!isEnabled()) {
      return;
    }

    await waitForInFlightSave();
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearThrottleTimer();

    const scheduler = getScheduler();
    if (scheduler.inFlight || getContext().saving === "pending") {
      await waitForInFlightSave();
    }
    if (clearQueueIfUnchanged()) {
      return;
    }

    clearQueue();
    return startAutoSave();
  };

  return {
    requestAutoSave,
    flushQueuedSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
    clearThrottleTimer,
    resolveSaveWaiters,
  };
};
