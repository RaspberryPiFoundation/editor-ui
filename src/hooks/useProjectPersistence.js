import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  isOwner,
  projectHasChangedSinceInitialLoad,
} from "../utils/projectHelpers";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../redux/EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";
import { useOwnerAutoSave } from "./useOwnerAutoSave";

const COMBINED_FILE_SIZE_SOFT_LIMIT = 1000000;

export const useProjectPersistence = ({
  user,
  project = {},
  justLoaded,
  hasShownSavePrompt,
  saveTriggered,
  reactAppApiEndpoint,
  loadRemix = true,
}) => {
  const dispatch = useDispatch();
  const initialComponents = useSelector(
    (state) => state.editor.initialComponents,
  );
  const initialProjectName = useSelector(
    (state) => state.editor.initialProjectName,
  );
  const initialProjectInstructions = useSelector(
    (state) => state.editor.initialProjectInstructions,
  );

  const { requestAutoSave } = useOwnerAutoSave({
    user,
    project,
    reactAppApiEndpoint,
  });

  const combinedFileSize = project.components?.reduce(
    (sum, component) => sum + component.content.length,
    0,
  );
  const autoSaveInterval =
    combinedFileSize > COMBINED_FILE_SIZE_SOFT_LIMIT ? 10000 : 2000;

  const saveToLocalStorage = (project) => {
    localStorage.setItem(
      project.identifier || "project",
      JSON.stringify(project),
    );
  };

  useEffect(() => {
    const saveProject = async () => {
      if (Object.keys(project).length !== 0) {
        const identifier = project?.identifier;
        const accessToken = user?.access_token;
        const params = { reactAppApiEndpoint, accessToken };

        if (saveTriggered || localStorage.getItem("awaitingSave")) {
          if (isOwner(user, project)) {
            await dispatch(
              syncProject("save")({ ...params, project, autosave: false }),
            );
            localStorage.removeItem("awaitingSave");
          } else if (user && identifier) {
            await dispatch(
              syncProject("remix")({
                ...params,
                project,
              }),
            );
            if (loadRemix) {
              // Ensure the remixed project is loaded, otherwise we'll get in a mess
              await dispatch(
                syncProject("loadRemix")({
                  ...params,
                  identifier,
                }),
              );
            }
          }
        }
      }
    };
    saveProject();
  }, [saveTriggered, project, user, dispatch, reactAppApiEndpoint, loadRemix]);

  useEffect(() => {
    let debouncer = setTimeout(() => {
      if (project) {
        if (isOwner(user, project) && project.identifier) {
          if (justLoaded) {
            dispatch(expireJustLoaded());
          }
          requestAutoSave();
        } else {
          const projectChangedSinceInitialLoad =
            projectHasChangedSinceInitialLoad(project, initialComponents, {
              initialName: initialProjectName,
              initialInstructions: initialProjectInstructions,
            });

          if (justLoaded) {
            dispatch(expireJustLoaded());
            if (!projectChangedSinceInitialLoad) {
              return;
            }
          }
          if (!hasShownSavePrompt) {
            user ? showSavePrompt() : showLoginPrompt();
            dispatch(setHasShownSavePrompt());
          }
          saveToLocalStorage(project);
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(debouncer);
  }, [dispatch, project, user, hasShownSavePrompt, autoSaveInterval]); // eslint-disable-line react-hooks/exhaustive-deps
  // Disabling exhasutive dependencies linting rule because adding justLoaded to the dependency array
  // triggers the save/login prompt too early. requestAutoSave reads latest state via refs.
};
