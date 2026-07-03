import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  isOwner,
  projectHasChangedSinceInitialLoad,
} from "../utils/projectHelpers";
import { syncProject } from "../redux/EditorSlice";

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

  const hasProjectChanged = () =>
    projectHasChangedSinceInitialLoad(
      projectRef.current,
      initialComponentsRef.current,
      {
        initialName: initialProjectNameRef.current,
        initialInstructions: initialProjectInstructionsRef.current,
      },
    );

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

    queuedRef.current = false;
    startOwnerAutoSave();
  };

  const flushQueuedSaveRef = useRef(flushQueuedSave);
  flushQueuedSaveRef.current = flushQueuedSave;

  const startOwnerAutoSave = () => {
    const currentProject = projectRef.current;
    const currentUser = userRef.current;

    inFlightRef.current = true;

    Promise.resolve(
      dispatch(
        syncProject("save")({
          reactAppApiEndpoint,
          project: currentProject,
          accessToken: currentUser.access_token,
          autosave: true,
        }),
      ),
    )
      .catch(() => {
        queuedRef.current = true;
      })
      .finally(() => {
        inFlightRef.current = false;
        flushQueuedSaveRef.current();
      });
  };

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

    startOwnerAutoSave();
  };

  useEffect(() => {
    const wasInProgress = prevCodeRunInProgressRef.current;
    prevCodeRunInProgressRef.current = codeRunInProgress;

    if (wasInProgress && !codeRunInProgress) {
      flushQueuedSaveRef.current();
    }
  }, [codeRunInProgress]);

  return { requestOwnerAutoSave };
};
