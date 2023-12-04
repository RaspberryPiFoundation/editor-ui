import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { disableTheming, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
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
        <WebComponentProject
          withSidebar={withSidebar}
          sidebarOptions={sidebarOptions}
        />
        {errorModalShowing ? <ErrorModal /> : null}
        {newFileModalShowing ? <NewFileModal /> : null}
        {renameFileModalShowing && modals.renameFile ? (
          <RenameFileModal />
        ) : null}
        {notFoundModalShowing ? <NotFoundModal /> : null}
        {accessDeniedNoAuthModalShowing ? <AccessDeniedNoAuthModal /> : null}
        {accessDeniedWithAuthModalShowing ? (
          <AccessDeniedWithAuthModal />
        ) : null}
      </SettingsContext.Provider>
    </>
  ) : (
    <>
      <p>{t("webComponent.loading")}</p>;
    </>
  );
};

export default WebComponentLoader;
