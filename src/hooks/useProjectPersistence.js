import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isOwner } from "../utils/projectHelpers";
import { syncProject } from "../redux/EditorSlice";
import { isEligibleForAutoSave } from "../utils/save/autoSaveLogic";
import { useAutoSave } from "./useAutoSave";
import { useLocalProjectBackup } from "./useLocalProjectBackup";

/**
 * Project persistence orchestration.
 *
 * On edit (debounced, automatic) — exactly one path is active:
 * - useAutoSave when canAutoSave (logged in as author, saved project).
 * - useLocalProjectBackup when !canAutoSave (not logged in, someone else's project,
 *   or author with no identifier yet).
 *
 * On explicit Save (saveTriggered / awaitingSave): manual save or remix via syncProject.
 */
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

  const canAutoSave = isEligibleForAutoSave(user, project);

  useAutoSave({
    enabled: canAutoSave,
    user,
    project,
    reactAppApiEndpoint,
    justLoaded,
  });

  useLocalProjectBackup({
    enabled: !canAutoSave,
    user,
    project,
    justLoaded,
    hasShownSavePrompt,
  });

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
};
