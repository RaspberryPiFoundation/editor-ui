import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  disableTheming,
  setSenseHatAlwaysEnabled,
  setLoadRemixDisabled,
} from "../redux/EditorSlice";
import WebComponentProject from "../components/WebComponentProject/WebComponentProject";
import { useTranslation } from "react-i18next";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";
import { useEmbeddedMode } from "../hooks/useEmbeddedMode";
import { useProjectPersistence } from "../hooks/useProjectPersistence";
import { SettingsContext } from "../utils/settings";
import { useCookies } from "react-cookie";
import NewFileModal from "../components/Modals/NewFileModal";
import ErrorModal from "../components/Modals/ErrorModal";
import RenameFileModal from "../components/Modals/RenameFileModal";
import { ToastContainer } from "react-toastify";
import ToastCloseButton from "../utils/ToastCloseButton";

import internalStyles from "../assets/stylesheets/InternalStyles.scss";
import externalStyles from "../assets/stylesheets/ExternalStyles.scss";
import "../assets/stylesheets/Notifications.scss";
import Style from "style-it";

const WebComponentLoader = (props) => {
  const {
    authKey,
    identifier,
    code,
    senseHatAlwaysEnabled = false,
    instructions,
    withProjectbar = false,
    projectNameEditable = false,
    withSidebar = false,
    sidebarOptions = [],
    theme,
    embedded = false,
    hostStyles,
    showSavePrompt = false,
    loadRemixDisabled = false,
  } = props;

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [projectIdentifier, setProjectIdentifier] = useState(identifier);
  localStorage.setItem("authKey", authKey);
  const user = useSelector((state) => state.auth.user);
  const [loadCache, setLoadCache] = useState(!!!user);
  const [loadRemix, setLoadRemix] = useState(!!user);
  const project = useSelector((state) => state.editor.project);
  const loading = useSelector((state) => state.editor.loading);
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const remixLoadFailed = useSelector((state) => state.editor.remixLoadFailed);
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

  const [cookies, setCookie] = useCookies(["theme", "fontSize"]);
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";

  useEmbeddedMode(embedded);

  useEffect(() => {
    if (theme) {
      dispatch(disableTheming());
      setCookie("theme", theme, { path: "/" });
    }
  }, [theme, setCookie, dispatch]);

  useEffect(() => {
    if (remixLoadFailed) {
      setLoadCache(true);
      setLoadRemix(false);
    } else {
      setLoadCache(!!!user);
      setLoadRemix(!!user);
    }
  }, [user, project, remixLoadFailed]);

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      setProjectIdentifier(project.identifier);
    }
  }, [loading, project]);

  useProject({
    projectIdentifier: projectIdentifier,
    code,
    accessToken: user?.access_token,
    loadRemix: loadRemix && !loadRemixDisabled,
    loadCache,
    remixLoadFailed,
  });

  useProjectPersistence({
    user,
    project,
    justLoaded,
    hasShownSavePrompt: hasShownSavePrompt || !showSavePrompt,
    saveTriggered,
  });

  useEffect(() => {
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
  }, [senseHatAlwaysEnabled, dispatch]);

  useEffect(() => {
    dispatch(setLoadRemixDisabled(loadRemixDisabled));
  }, [loadRemixDisabled, dispatch]);

  useEffect(() => {
    if (instructions) {
      dispatch(setInstructions(instructions));
    }
  }, [instructions, dispatch]);

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
              nameEditable={projectNameEditable}
              withSidebar={withSidebar}
              sidebarOptions={sidebarOptions}
            />
            {errorModalShowing && <ErrorModal />}
            {newFileModalShowing && <NewFileModal />}
            {renameFileModalShowing && modals.renameFile && <RenameFileModal />}
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
