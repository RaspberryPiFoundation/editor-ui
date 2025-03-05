import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  disableTheming,
  setSenseHatAlwaysEnabled,
  setLoadRemixDisabled,
  setReactAppApiEndpoint,
  setReadOnly,
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
import editorStyles from "../assets/stylesheets/index.scss";
import "../assets/stylesheets/Notifications.scss";
import Style from "style-it";
import { projectOwnerLoadedEvent } from "../events/WebComponentCustomEvents";

const WebComponentLoader = (props) => {
  const {
    assetsIdentifier,
    authKey,
    code,
    embedded = false,
    editableInstructions,
    hostStyles, // Pass in styles from the host
    identifier,
    instructions,
    theme,
    loadRemixDisabled = false,
    outputOnly = false,
    outputPanels = ["text", "visual"],
    outputSplitView = false,
    projectNameEditable = false,
    reactAppApiEndpoint = process.env.REACT_APP_API_ENDPOINT,
    readOnly = false,
    senseHatAlwaysEnabled = false,
    showSavePrompt = false,
    sidebarOptions = [],
    useEditorStyles = false, // If true use the standard editor styling for the web component
    withProjectbar = false,
    withSidebar = false,
    loadCache = true, // Always use cache unless explicitly disabled
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [projectIdentifier, setProjectIdentifier] = useState(identifier);
  localStorage.setItem("authKey", authKey);
  const localStorageUser = authKey
    ? JSON.parse(localStorage.getItem(authKey))
    : null;
  const user = useSelector((state) => state.auth.user || localStorageUser);
  const [loadRemix, setLoadRemix] = useState(!!user);
  const project = useSelector((state) => state.editor.project);
  const projectOwner = useSelector((state) => state.editor.project.user_name);
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
      setLoadRemix(false);
    } else {
      setLoadRemix(!!user);
    }
  }, [user, project, remixLoadFailed]);

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      setProjectIdentifier(project.identifier);
    }
  }, [loading, project]);

  useEffect(() => {
    if (justLoaded) {
      document.dispatchEvent(projectOwnerLoadedEvent(projectOwner));
    }
  }, [projectOwner, justLoaded]);

  useProject({
    reactAppApiEndpoint,
    projectIdentifier: projectIdentifier,
    assetsIdentifier: assetsIdentifier,
    code,
    accessToken: user?.access_token,
    loadRemix: loadRemix && !loadRemixDisabled,
    loadCache,
    remixLoadFailed,
  });

  useProjectPersistence({
    reactAppApiEndpoint,
    user,
    project,
    justLoaded,
    hasShownSavePrompt: hasShownSavePrompt || !showSavePrompt,
    saveTriggered,
    loadRemix: loadRemix && !loadRemixDisabled,
  });

  useEffect(() => {
    dispatch(setReactAppApiEndpoint(reactAppApiEndpoint));
  }, [reactAppApiEndpoint, dispatch]);

  useEffect(() => {
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
  }, [senseHatAlwaysEnabled, dispatch]);

  useEffect(() => {
    dispatch(setLoadRemixDisabled(loadRemixDisabled));
  }, [loadRemixDisabled, dispatch]);

  useEffect(() => {
    if (instructions) {
      dispatch(setInstructions({ ...instructions, permitOverride: false }));
    }
  }, [instructions, dispatch]);

  useEffect(() => {
    dispatch(setReadOnly(readOnly));
  }, [readOnly, dispatch]);

  useEffect(() => {
    // Create a script element to save the existing Prism object if there is one
    const script = document.createElement("script");
    script.textContent = `
      if (window.Prism) {
        window.syntaxHighlight = window.Prism;
      }
    `;

    // Append the script to the document body
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const renderSuccessState = () => (
    <>
      <SettingsContext.Provider
        value={{
          theme: cookies.theme || themeDefault,
          fontSize: cookies.fontSize || "small",
        }}
      >
        <style>{externalStyles.toString()}</style>
        {useEditorStyles && <style>{editorStyles.toString()}</style>}
        {hostStyles && <style>{hostStyles}</style>}
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
              outputOnly={outputOnly}
              outputPanels={outputPanels}
              outputSplitView={outputSplitView}
              editableInstructions={editableInstructions}
            />
            {errorModalShowing && <ErrorModal />}
            {newFileModalShowing && <NewFileModal />}
            {renameFileModalShowing && modals.renameFile && <RenameFileModal />}
          </div>
        </Style>
      </SettingsContext.Provider>
    </>
  );

  const renderFailedState = () => (
    <>
      <p>{t("webComponent.failed")}</p>
    </>
  );

  const renderLoadingState = () => (
    <>
      <p>{t("webComponent.loading")}</p>
    </>
  );

  if (loading === "success") {
    return renderSuccessState();
  } else if (["idle", "failed"].includes(loading)) {
    return renderFailedState();
  } else {
    return renderLoadingState();
  }
};

export default WebComponentLoader;
