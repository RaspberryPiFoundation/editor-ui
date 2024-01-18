import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  disableTheming,
  setSenseHatAlwaysEnabled,
  stopCodeRun,
  stopDraw,
  triggerCodeRun,
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
import { codeLoadedEvent } from "../events/WebComponentCustomEvents";

const WebComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const {
    authKey,
    identifier,
    code,
    senseHatAlwaysEnabled = false,
    instructions,
    withSidebar = false,
    sidebarOptions = [],
    theme,
    outputOnly = false,
    embedded = false,
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

  const [cookies, setCookie] = useCookies(["theme", "fontSize"]);
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";

  const [isRunCodeListenerAdded, setIsRunCodeListenerAdded] = useState(false);

  const runCode = () => {
    dispatch(stopCodeRun());
    dispatch(stopDraw());
    dispatch(triggerCodeRun());
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (outputOnly && !isRunCodeListenerAdded) {
      document.removeEventListener("outputOnly-runCode", runCode);
      document.addEventListener("outputOnly-runCode", runCode);
      setIsRunCodeListenerAdded(true);
    }
  });

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

  useEmbeddedMode(outputOnly);

  useEffect(() => {
    if (loading === "success") {
      document.dispatchEvent(codeLoadedEvent);
    }
  }, [loading]);

  return loading === "success" ? (
    <>
      <SettingsContext.Provider
        value={{
          theme: cookies.theme || themeDefault,
          fontSize: cookies.fontSize || "small",
        }}
      >
        <WebComponentProject
          withSidebar={withSidebar}
          sidebarOptions={sidebarOptions}
          outputOnly={outputOnly === "true"}
        />
      </SettingsContext.Provider>
    </>
  ) : (
    <>
      <p>{t("webComponent.loading")}</p>;
    </>
  );
};

export default WebComponentLoader;
