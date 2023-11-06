import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isOwner } from "../utils/projectHelpers";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  showLoginToSaveModal,
  syncProject,
} from "../redux/EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";

export const useProjectPersistence = ({
  user,
  project,
  justLoaded,
  hasShownSavePrompt,
  saveTriggered,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (saveTriggered) {
      if (isOwner(user, project)) {
        dispatch(
          syncProject("save")({
            project,
            accessToken: user.access_token,
            autosave: false,
          }),
        );
      } else if (user && project.identifier) {
        dispatch(
          syncProject("remix")({ project, accessToken: user.access_token }),
        );
      } else {
        dispatch(showLoginToSaveModal());
      }
    }
  }, [saveTriggered, project, user, dispatch]);

  useEffect(() => {
    if (user && localStorage.getItem("awaitingSave")) {
      if (isOwner(user, project)) {
        dispatch(
          syncProject("save")({
            project,
            accessToken: user.access_token,
            autosave: false,
          }),
        );
      } else if (user && project.identifier) {
        dispatch(
          syncProject("remix")({ project, accessToken: user.access_token }),
        );
      }
      localStorage.removeItem("awaitingSave");
      return;
    }
    let debouncer = setTimeout(() => {
      if (isOwner(user, project) && project.identifier) {
        if (justLoaded) {
          dispatch(expireJustLoaded());
        }
        dispatch(
          syncProject("save")({
            project,
            accessToken: user.access_token,
            autosave: true,
          }),
        );
      } else {
        if (justLoaded) {
          dispatch(expireJustLoaded());
        } else {
          localStorage.setItem(
            project.identifier || "project",
            JSON.stringify(project),
          );
          if (!hasShownSavePrompt) {
            user ? showSavePrompt() : showLoginPrompt();
            dispatch(setHasShownSavePrompt());
          }
        }
      }
    }, 2000);

    return () => clearTimeout(debouncer);
  }, [dispatch, project, user, hasShownSavePrompt, justLoaded]);
};
