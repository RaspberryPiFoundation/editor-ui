import { useEffect, useEffectEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  isOwner,
  projectHasChangedSinceInitialLoad,
} from "../utils/projectHelpers";
import { syncProject } from "../redux/EditorSlice";
import {
  clearOwnerAutoSaveHostApi,
  registerOwnerAutoSaveHostApi,
} from "../utils/ownerAutoSaveHostApi";

const OWNER_AUTOSAVE_COOLDOWN_MS = 10000;

/**
 * Owner autosave state machine:
 *
 * - requestOwnerAutoSave: called on edit; saves immediately or queues when blocked/in cooldown.
 * - flushQueuedSave: drains the queue when run/save/cooldown allows (e.g. after run ends).
 * - flushPendingAutoSave: force-save for navigation/pagehide; bypasses cooldown, waits for
 *   in-flight saves first.
 *
 * Blocked when: code is running, owner autosave in flight, or any Redux save is pending.
 *
 * hasPendingAutoSave: queued | inFlight | in cooldown (for "work still outstanding").
 * shouldFlushBeforeNavigation: project dirty only (navigation must save even during cooldown).
 */
export const useOwnerAutoSave = ({ user, project, reactAppApiEndpoint }) => {
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
  const savingRef = useRef(saving);
  const codeRunInProgressRef = useRef(codeRunInProgress);
  const projectRef = useRef(project);
  const userRef = useRef(user);
  const initialComponentsRef = useRef(initialComponents);
  const initialProjectNameRef = useRef(initialProjectName);
  const initialProjectInstructionsRef = useRef(initialProjectInstructions);
  const prevCodeRunInProgressRef = useRef(codeRunInProgress);

  // Keep latest Redux/props in refs for useEffectEvent handlers (async-safe, no stale closures).
  savingRef.current = saving;
  codeRunInProgressRef.current = codeRunInProgress;
  projectRef.current = project;
  userRef.current = user;
  initialComponentsRef.current = initialComponents;
  initialProjectNameRef.current = initialProjectName;
  initialProjectInstructionsRef.current = initialProjectInstructions;

  const isEligibleForOwnerAutoSave = () =>
    isOwner(userRef.current, projectRef.current) &&
    Boolean(projectRef.current?.identifier);

  const isSaveBlocked = () =>
    codeRunInProgressRef.current ||
    schedulerRef.current.inFlight ||
    savingRef.current === "pending";

  const getRemainingAutoSaveCooldownMs = () => {
    if (schedulerRef.current.lastCompletedAt == null) {
      return 0;
    }

    return Math.max(
      0,
      schedulerRef.current.lastCompletedAt +
        OWNER_AUTOSAVE_COOLDOWN_MS -
        Date.now(),
    );
  };

  const clearCooldownTimer = () => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  };

  const hasProjectChanged = () =>
    projectHasChangedSinceInitialLoad(
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

    if (getRemainingAutoSaveCooldownMs() > 0) {
      scheduleCooldownFlush();
      return;
    }

    clearQueue();
    startOwnerAutoSave().catch(() => {});
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

  const startOwnerAutoSave = useEffectEvent(() => {
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
        throw new Error("owner autosave failed");
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
      isEligibleForOwnerAutoSave() &&
      hasProjectChanged() &&
      (schedulerRef.current.queued ||
        schedulerRef.current.inFlight ||
        getRemainingAutoSaveCooldownMs() > 0)
    );
  });

  const shouldFlushBeforeNavigation = useEffectEvent(() => {
    return isEligibleForOwnerAutoSave() && hasProjectChanged();
  });

  const requestOwnerAutoSave = useEffectEvent(() => {
    if (!isEligibleForOwnerAutoSave()) {
      return;
    }

    if (!hasProjectChanged()) {
      return;
    }

    if (isSaveBlocked()) {
      schedulerRef.current.queued = true;
      return;
    }

    if (getRemainingAutoSaveCooldownMs() > 0) {
      schedulerRef.current.queued = true;
      scheduleCooldownFlush();
      return;
    }

    clearQueue();
    startOwnerAutoSave().catch(() => {});
  });

  const flushPendingAutoSave = useEffectEvent(async () => {
    if (!isEligibleForOwnerAutoSave()) {
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
    return startOwnerAutoSave();
  });

  // Resume flush waiters when a Redux save (manual or autosave) leaves pending.
  useEffect(() => {
    if (saving !== "pending") {
      const waiters = pendingSaveWaitersRef.current;
      pendingSaveWaitersRef.current = [];
      waiters.forEach((resolve) => resolve());
    }
  }, [saving]);

  // Register host API and page lifecycle handlers on mount.
  useEffect(() => {
    registerOwnerAutoSaveHostApi({
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
      clearOwnerAutoSaveHostApi();
    };
    // useEffectEvent callbacks are stable and always invoke the latest logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retry queued autosave when a Python code run finishes.
  useEffect(() => {
    const wasInProgress = prevCodeRunInProgressRef.current;
    prevCodeRunInProgressRef.current = codeRunInProgress;

    if (wasInProgress && !codeRunInProgress) {
      flushQueuedSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRunInProgress]);

  return {
    requestOwnerAutoSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
  };
};
