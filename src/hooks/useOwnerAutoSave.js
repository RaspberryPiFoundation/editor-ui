import { useEffect, useRef } from "react";
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

  const hasPendingAutoSave = () => {
    const currentProject = projectRef.current;
    const currentUser = userRef.current;

    return (
      isOwner(currentUser, currentProject) &&
      currentProject?.identifier &&
      hasProjectChanged() &&
      (queuedRef.current ||
        inFlightRef.current ||
        getRemainingAutoSaveCooldownMs() > 0)
    );
  };

  const shouldFlushBeforeNavigation = () => {
    const currentProject = projectRef.current;
    const currentUser = userRef.current;

    return (
      isOwner(currentUser, currentProject) &&
      currentProject?.identifier &&
      hasProjectChanged()
    );
  };

  const waitForInFlightSave = async () => {
    if (inFlightSavePromiseRef.current) {
      await inFlightSavePromiseRef.current;
    }
  };

  const startOwnerAutoSave = () => {
    const currentProject = projectRef.current;
    const currentUser = userRef.current;

    inFlightRef.current = true;

    const savePromise = Promise.resolve(
      dispatch(
        syncProject("save")({
          reactAppApiEndpoint,
          project: currentProject,
          accessToken: currentUser.access_token,
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
        flushQueuedSaveRef.current();
      });

    inFlightSavePromiseRef.current = savePromise;
    return savePromise;
  };

  const flushQueuedSave = () => {
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
      scheduleCooldownFlushRef.current();
      return;
    }

    queuedRef.current = false;
    startOwnerAutoSave().catch(() => {});
  };

  const flushQueuedSaveRef = useRef(flushQueuedSave);
  flushQueuedSaveRef.current = flushQueuedSave;

  const scheduleCooldownFlush = () => {
    const remainingCooldown = getRemainingAutoSaveCooldownMs();
    if (remainingCooldown <= 0) {
      flushQueuedSaveRef.current();
      return;
    }

    if (cooldownTimerRef.current) {
      return;
    }

    cooldownTimerRef.current = setTimeout(() => {
      cooldownTimerRef.current = null;
      flushQueuedSaveRef.current();
    }, remainingCooldown);
  };

  const scheduleCooldownFlushRef = useRef(scheduleCooldownFlush);
  scheduleCooldownFlushRef.current = scheduleCooldownFlush;

  const requestOwnerAutoSave = () => {
    const currentProject = projectRef.current;
    const currentUser = userRef.current;

    if (!isOwner(currentUser, currentProject) || !currentProject?.identifier) {
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
      scheduleCooldownFlushRef.current();
      return;
    }

    queuedRef.current = false;
    startOwnerAutoSave().catch(() => {});
  };

  const flushPendingAutoSave = async () => {
    const currentProject = projectRef.current;
    const currentUser = userRef.current;

    if (!isOwner(currentUser, currentProject) || !currentProject?.identifier) {
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
  };

  const flushPendingAutoSaveRef = useRef(flushPendingAutoSave);
  flushPendingAutoSaveRef.current = flushPendingAutoSave;

  const hasPendingAutoSaveRef = useRef(hasPendingAutoSave);
  hasPendingAutoSaveRef.current = hasPendingAutoSave;

  const shouldFlushBeforeNavigationRef = useRef(shouldFlushBeforeNavigation);
  shouldFlushBeforeNavigationRef.current = shouldFlushBeforeNavigation;

  useEffect(() => {
    registerOwnerAutoSaveHostApi({
      hasPendingAutoSave: () => hasPendingAutoSaveRef.current(),
      flushPendingAutoSave: () => flushPendingAutoSaveRef.current(),
      shouldFlushBeforeNavigation: () =>
        shouldFlushBeforeNavigationRef.current(),
    });

    return () => {
      clearOwnerAutoSaveHostApi();
    };
  }, []);

  useEffect(() => {
    const wasInProgress = prevCodeRunInProgressRef.current;
    prevCodeRunInProgressRef.current = codeRunInProgress;

    if (wasInProgress && !codeRunInProgress) {
      flushQueuedSaveRef.current();
    }
  }, [codeRunInProgress]);

  useEffect(() => {
    const handlePageHide = () => {
      flushPendingAutoSaveRef.current();
    };

    const handleBeforeUnload = (event) => {
      if (!hasPendingAutoSaveRef.current()) {
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
      flushPendingAutoSaveRef.current();
    };
  }, []);

  return {
    requestOwnerAutoSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
  };
};
