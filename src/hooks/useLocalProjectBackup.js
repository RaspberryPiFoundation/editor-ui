import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectHasChangedSinceInitialLoad } from "../utils/projectHelpers";
import { isEligibleForAutoSave } from "../utils/autoSaveLogic";
import { expireJustLoaded, setHasShownSavePrompt } from "../redux/EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";
import { getAutosaveDebounceMs } from "../utils/autoSaveScheduling";

export const persistProjectToLocalStorage = (project) => {
  localStorage.setItem(
    project.identifier || "project",
    JSON.stringify(project),
  );
};

/**
 * Debounced local backup to localStorage, with save/login prompts.
 *
 * Used when the user cannot autosave this project to the API (see isEligibleForAutoSave):
 *
 * - Not logged in — backs up to localStorage and shows a login prompt.
 * - Logged in, but someone else's project — backs up and shows a save prompt (remix flow).
 * - Logged in as author, project not saved yet (no identifier) — backs up until the first save.
 *
 * Skipped when isEligibleForAutoSave is true (logged in as author, saved project);
 * useAutoSave handles API persistence instead.
 * The two hooks never overlap on the same edit.
 */
export const useLocalProjectBackup = ({
  user,
  project = {},
  justLoaded,
  hasShownSavePrompt,
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

  const localBackupDebounceMs = getAutosaveDebounceMs(project);
  const justLoadedRef = useRef(justLoaded);
  justLoadedRef.current = justLoaded;

  useEffect(() => {
    if (isEligibleForAutoSave(user, project)) {
      return;
    }

    let debouncer = setTimeout(() => {
      if (!project) {
        return;
      }

      const projectChangedSinceInitialLoad = projectHasChangedSinceInitialLoad(
        project,
        initialComponents,
        {
          initialName: initialProjectName,
          initialInstructions: initialProjectInstructions,
        },
      );

      if (justLoadedRef.current) {
        dispatch(expireJustLoaded());
        if (!projectChangedSinceInitialLoad) {
          return;
        }
      }
      if (!hasShownSavePrompt) {
        user ? showSavePrompt() : showLoginPrompt();
        dispatch(setHasShownSavePrompt());
      }
      persistProjectToLocalStorage(project);
    }, localBackupDebounceMs);

    return () => clearTimeout(debouncer);
  }, [
    dispatch,
    project,
    user,
    hasShownSavePrompt,
    localBackupDebounceMs,
    initialComponents,
    initialProjectName,
    initialProjectInstructions,
  ]);
};
