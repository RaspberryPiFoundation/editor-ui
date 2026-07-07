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

  const queuedRef = useRef(false);
  const inFlightRef = useRef(false);
  const inFlightSavePromiseRef = useRef(null);
  const pendingSaveWaitersRef = useRef([]);
  const cooldownTimerRef = useRef(null);
  const lastAutoSaveCompletedAtRef = useRef(null);
  const savingRef = useRef(saving);
  const codeRunInProgressRef = useRef(codeRunInProgress);
  const projectRef = useRef(project);
  const userRef = useRef(user);
  const initialComponentsRef = useRef(initialComponents);
  const initialProjectNameRef = useRef(initialProjectName);
  const initialProjectInstructionsRef = useRef(initialProjectInstructions);
  const prevCodeRunInProgressRef = useRef(codeRunInProgress);

  savingRef.current = saving;
  codeRunInProgressRef.current = codeRunInProgress;
  projectRef.current = project;
  userRef.current = user;
  initialComponentsRef.current = initialComponents;
  initialProjectNameRef.current = initialProjectName;
  initialProjectInstructionsRef.current = initialProjectInstructions;

  const getRemainingAutoSaveCooldownMs = () => {
    if (lastAutoSaveCompletedAtRef.current == null) {
      return 0;
    }

    return Math.max(
      0,
      lastAutoSaveCompletedAtRef.current +
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
    if (!queuedRef.current || !hasProjectChanged()) {
      queuedRef.current = false;
      return;
    }

    if (
      codeRunInProgressRef.current ||
      inFlightRef.current ||
      savingRef.current === "pending"
    ) {
      return;
    }

    if (getRemainingAutoSaveCooldownMs() > 0) {
      scheduleCooldownFlush();
      return;
    }

    queuedRef.current = false;
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
    inFlightRef.current = true;

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
        lastAutoSaveCompletedAtRef.current = Date.now();
      })
      .catch(() => {
        queuedRef.current = true;
        throw new Error("owner autosave failed");
      })
      .finally(() => {
        inFlightRef.current = false;
        inFlightSavePromiseRef.current = null;
        flushQueuedSave();
      });

    inFlightSavePromiseRef.current = savePromise;
    return savePromise;
  });

  const hasPendingAutoSave = useEffectEvent(() => {
    return (
      isOwner(userRef.current, projectRef.current) &&
      projectRef.current?.identifier &&
      hasProjectChanged() &&
      (queuedRef.current ||
        inFlightRef.current ||
        getRemainingAutoSaveCooldownMs() > 0)
    );
  });

  const shouldFlushBeforeNavigation = useEffectEvent(() => {
    return (
      isOwner(userRef.current, projectRef.current) &&
      projectRef.current?.identifier &&
      hasProjectChanged()
    );
  });

  const requestOwnerAutoSave = useEffectEvent(() => {
    if (
      !isOwner(userRef.current, projectRef.current) ||
      !projectRef.current?.identifier
    ) {
      return;
    }

    if (!hasProjectChanged()) {
      return;
    }

    if (
      codeRunInProgressRef.current ||
      inFlightRef.current ||
      savingRef.current === "pending"
    ) {
      queuedRef.current = true;
      return;
    }

    if (getRemainingAutoSaveCooldownMs() > 0) {
      queuedRef.current = true;
      scheduleCooldownFlush();
      return;
    }

    queuedRef.current = false;
    startOwnerAutoSave().catch(() => {});
  });

  const flushPendingAutoSave = useEffectEvent(async () => {
    if (
      !isOwner(userRef.current, projectRef.current) ||
      !projectRef.current?.identifier
    ) {
      return;
    }

    await waitForInFlightSave();

    if (!hasProjectChanged()) {
      queuedRef.current = false;
      return;
    }

    clearCooldownTimer();

    if (inFlightRef.current || savingRef.current === "pending") {
      await waitForInFlightSave();
    }

    if (!hasProjectChanged()) {
      queuedRef.current = false;
      return;
    }

    queuedRef.current = false;
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
