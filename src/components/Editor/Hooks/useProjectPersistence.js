import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isOwner } from "../../../utils/projectHelpers";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  showLoginToSaveModal,
  syncProject,
} from "../EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../../../utils/Notifications";

export const useProjectPersistence = ({ user }) => {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.editor.project);
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const hasShownSavePrompt = useSelector(
    (state) => state.editor.hasShownSavePrompt,
  );
  const saveTriggered = useSelector((state) => state.editor.saveTriggered);

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
  }, [saveTriggered]);

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
        console.log(user.access_token);
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
