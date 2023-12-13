import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  disableTheming,
  setSenseHatAlwaysEnabled,
  triggerSave,
} from "../redux/EditorSlice";
import WebComponentProject from "../components/WebComponentProject/WebComponentProject";
import { useTranslation } from "react-i18next";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";
import { useEmbeddedMode } from "../hooks/useEmbeddedMode";
import { useProjectPersistence } from "../hooks/useProjectPersistence";
import { removeUser, setUser } from "../redux/WebComponentAuthSlice";
import { SettingsContext } from "../utils/settings";
import { useCookies } from "react-cookie";
import NewFileModal from "../components/Modals/NewFileModal";
import ErrorModal from "../components/Modals/ErrorModal";
import RenameFileModal from "../components/Modals/RenameFileModal";
import NotFoundModal from "../components/Modals/NotFoundModal";
import AccessDeniedNoAuthModal from "../components/Modals/AccessDeniedNoAuthModal";
import AccessDeniedWithAuthModal from "../components/Modals/AccessDeniedWithAuthModal";
import { ToastContainer } from "react-toastify";
import ToastCloseButton from "../utils/ToastCloseButton";

import internalStyles from "../assets/stylesheets/InternalStyles.scss";
import externalStyles from "../assets/stylesheets/ExternalStyles.scss";
import "../assets/stylesheets/Notifications.scss";
import Style from "style-it";

const WebComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const {
    authKey,
    identifier,
    code,
    senseHatAlwaysEnabled = false,
    instructions,
    withProjectbar = false,
    withSidebar = false,
    sidebarOptions = [],
    theme,
    embedded = false,
    hostStyles,
  } = props;

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [projectIdentifier, setProjectIdentifier] = useState(identifier);
  const project = useSelector((state) => state.editor.project);
  const user = JSON.parse(localStorage.getItem(authKey));
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const hasShownSavePrompt = useSelector(
    (state) => state.editor.hasShownSavePrompt,
  );
  const saveTriggered = useSelector((state) => state.editor.saveTriggered);
  const modals = useSelector((state) => state.editor.modals);
  const errorModalShowing = useSelector(
    (state) => state.editor.errorModalShowing,
  );
  const newFileModalShowing = useSelector(
    (state) => state.editor.newFileModalShowing,
  );
  const renameFileModalShowing = useSelector(
    (state) => state.editor.renameFileModalShowing,
  );
  const notFoundModalShowing = useSelector(
    (state) => state.editor.notFoundModalShowing,
  );
  const accessDeniedNoAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedNoAuthModalShowing,
  );
  const accessDeniedWithAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedWithAuthModalShowing,
  );

  const [cookies, setCookie] = useCookies(["theme", "fontSize"]);
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";

  useEffect(() => {
    dispatch(triggerSave());
  }, [dispatch]);

  useEffect(() => {
    if (theme) {
      dispatch(disableTheming());
      setCookie("theme", theme, { path: "/" });
    }
  }, [theme, setCookie, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    } else {
      dispatch(removeUser());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      setProjectIdentifier(project.identifier);
    }
  }, [loading, project]);

  useProject({
    projectIdentifier: projectIdentifier,
    code,
    accessToken: user && user.access_token,
  });

  useProjectPersistence({
    user,
    project,
    justLoaded,
    hasShownSavePrompt,
    saveTriggered,
  });

  useEffect(() => {
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
  }, [senseHatAlwaysEnabled, dispatch]);

  useEffect(() => {
    if (instructions) {
      dispatch(setInstructions(instructions));
    }
  }, [instructions, dispatch]);

  useEmbeddedMode(embedded);

  return loading === "success" ? (
    <>
      <SettingsContext.Provider
        value={{
          theme: cookies.theme || themeDefault,
          fontSize: cookies.fontSize || "small",
        }}
      >
        <style>{externalStyles.toString()}</style>
        <style>{hostStyles}</style>
        <Style>
          {internalStyles.toString()}
          <div id="wc" className={`--${cookies.theme || themeDefault}`}>
            <ToastContainer
              enableMultiContainer
              containerId="top-center"
              position="top-center"
              className="toast--top-center"
              closeButton={ToastCloseButton}
            />
            <WebComponentProject
              withProjectbar={withProjectbar}
              withSidebar={withSidebar}
              sidebarOptions={sidebarOptions}
            />
            {errorModalShowing && <ErrorModal />}
            {newFileModalShowing && <NewFileModal />}
            {renameFileModalShowing && modals.renameFile && <RenameFileModal />}
            {notFoundModalShowing && <NotFoundModal />}
            {accessDeniedNoAuthModalShowing && <AccessDeniedNoAuthModal />}
            {accessDeniedWithAuthModalShowing && <AccessDeniedWithAuthModal />}
          </div>
        </Style>
      </SettingsContext.Provider>
    </>
  ) : (
    <>
      <p>{t("webComponent.loading")}</p>;
    </>
  );
};

export default WebComponentLoader;
