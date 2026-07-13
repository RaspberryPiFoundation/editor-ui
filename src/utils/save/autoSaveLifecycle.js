import { syncProject } from "../../redux/EditorSlice";
import {
  AUTOSAVE_COOLDOWN_MS,
  clearTimerRef,
  getRemainingCooldownMs,
  hasOutstandingAutosaveWork,
  isInAutosaveCooldown,
} from "./autoSaveScheduling";
import {
  hasProjectChangedForAutoSave,
  isAutoSaveBlocked,
} from "./autoSaveLogic";

/**
 * Python/HTML autosave lifecycle: queue → in-flight save → cooldown → flush.
 *
 * requestAutoSave: tries to save immediately, or queues when blocked/in cooldown.
 * flushQueuedSave: drains the queue when run/save/cooldown allows.
 * flushPendingAutoSave: force-save for navigation/pagehide; bypasses cooldown.
 */
export const createAutoSaveLifecycle = ({
  dispatch,
  getContext,
  getScheduler,
  inFlightSavePromiseRef,
  pendingSaveWaitersRef,
  cooldownTimerRef,
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

  // --- Queue: edits while blocked, in-flight, or in cooldown ---

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

  // --- Cooldown: 10s after a successful API save ---

  const getRemainingAutoSaveCooldownMs = () =>
    getRemainingCooldownMs(
      getScheduler().lastCompletedAt,
      AUTOSAVE_COOLDOWN_MS,
    );

  const clearCooldownTimer = () => clearTimerRef(cooldownTimerRef);

  const startCooldown = () => {
    getScheduler().lastCompletedAt = Date.now();
  };

  const deferUntilCooldownEnds = () => {
    enqueueSave();
    scheduleCooldownFlush();
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
        startCooldown();
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

    if (isInAutosaveCooldown(scheduler.lastCompletedAt)) {
      scheduleCooldownFlush();
      return;
    }

    clearQueue();
    startAutoSave().catch(() => {});
  };

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

    if (isInAutosaveCooldown(getScheduler().lastCompletedAt)) {
      deferUntilCooldownEnds();
      return;
    }

    clearQueue();
    startAutoSave().catch(() => {});
  };

  // --- Navigation flush: bypass cooldown ---

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

    clearCooldownTimer();

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
    clearCooldownTimer,
    resolveSaveWaiters,
  };
};
