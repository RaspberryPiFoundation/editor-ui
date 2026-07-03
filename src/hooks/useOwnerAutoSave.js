import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  isOwner,
  projectHasChangedSinceInitialLoad,
} from "../utils/projectHelpers";
import { syncProject } from "../redux/EditorSlice";

export const useOwnerAutoSave = ({ user, project, reactAppApiEndpoint }) => {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.editor.saving);
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
  const projectRef = useRef(project);
  const userRef = useRef(user);
  const initialComponentsRef = useRef(initialComponents);
  const initialProjectNameRef = useRef(initialProjectName);
  const initialProjectInstructionsRef = useRef(initialProjectInstructions);

  savingRef.current = saving;
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

    queuedRef.current = false;
    startOwnerAutoSave();
  };

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
        flushQueuedSave();
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

    if (inFlightRef.current || savingRef.current === "pending") {
      queuedRef.current = true;
      return;
    }

    startOwnerAutoSave();
  };

  return { requestOwnerAutoSave };
};
