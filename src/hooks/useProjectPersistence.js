import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isOwner } from "../utils/projectHelpers";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../redux/EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";

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
        if (saveTriggered || (user && localStorage.getItem("awaitingSave"))) {
          if (isOwner(user, project)) {
            dispatch(
              syncProject("save")({
                reactAppApiEndpoint,
                project,
                accessToken: user.access_token,
                autosave: false,
              }),
            );
          } else if (user && project.identifier) {
            await dispatch(
              syncProject("remix")({
                reactAppApiEndpoint,
                project,
                accessToken: user.access_token,
              }),
            );
            // Ensure the remixed project is loaded, otherwise we'll get in a mess
            if (loadRemix) {
              dispatch(
                syncProject("loadRemix")({
                  reactAppApiEndpoint,
                  identifier: project.identifier,
                  accessToken: user.access_token,
                }),
              );
            }
          }
          localStorage.removeItem("awaitingSave");
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
          dispatch(
            syncProject("save")({
              reactAppApiEndpoint,
              project,
              accessToken: user.access_token,
              autosave: true,
            }),
          );
        } else {
          if (justLoaded) {
            dispatch(expireJustLoaded());
          } else {
            saveToLocalStorage(project);

            if (!hasShownSavePrompt) {
              user ? showSavePrompt() : showLoginPrompt();
              dispatch(setHasShownSavePrompt());
            }
          }
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(debouncer);
  }, [dispatch, project, user, hasShownSavePrompt]); // eslint-disable-line react-hooks/exhaustive-deps
  // Disabling exhasutive dependencies linting rule because adding justLoaded to the dependency array
  // triggers the save/login prompt too early
};
