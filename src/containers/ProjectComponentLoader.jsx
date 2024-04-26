import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEmbeddedMode } from "../hooks/useEmbeddedMode";
import { useMediaQuery } from "react-responsive";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../utils/login";

import { MOBILE_MEDIA_QUERY } from "../utils/mediaQueryBreakpoints";

import Project from "../components/Editor/Project/Project";
import MobileProject from "../components/Mobile/MobileProject/MobileProject";
import NewFileModal from "../components/Modals/NewFileModal";
import NotFoundModal from "../components/Modals/NotFoundModal";
import AccessDeniedNoAuthModal from "../components/Modals/AccessDeniedNoAuthModal";
import AccessDeniedWithAuthModal from "../components/Modals/AccessDeniedWithAuthModal";
import RenameFileModal from "../components/Modals/RenameFileModal";
import ErrorModal from "../components/Modals/ErrorModal";
// import { useProject } from "../hooks/useProject";
// import { useProjectPersistence } from "../hooks/useProjectPersistence";

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();
  const embedded = props.embedded || false;
  // const user = useSelector((state) => state.auth.user);
  // const accessToken = user ? user.access_token : null;
  const project = useSelector((state) => state.editor.project);
  // const justLoaded = useSelector((state) => state.editor.justLoaded);
  // const hasShownSavePrompt = useSelector(
  //   (state) => state.editor.hasShownSavePrompt,
  // );
  // const saveTriggered = useSelector((state) => state.editor.saveTriggered);
  const location = useLocation();

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

  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  useEmbeddedMode(embedded);

  // TODO: sort out loading and error states
  // useProject({ projectIdentifier: identifier, accessToken: accessToken });
  // useProjectPersistence({
  //   user,
  //   project,
  //   justLoaded,
  //   hasShownSavePrompt,
  //   saveTriggered,
  // });

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      navigate(`/${i18n.language}/projects/${project.identifier}`);
    }
    if (loading === "failed") {
      navigate("/");
    }
  }, [loading, project, i18n.language, navigate]);

  useEffect(() => {
    const handleLogIn = () => {
      login({ project, location });
    };

    document.addEventListener("editor-logIn", handleLogIn);
    return () => {
      document.removeEventListener("editor-logIn", handleLogIn);
    };
  }, [project, location]);

  return (
    <>
      {isMobile ? (
        <MobileProject identifier={identifier} />
      ) : (
        <Project identifier={identifier} />
      )}
      {errorModalShowing && <ErrorModal />}
      {newFileModalShowing && <NewFileModal />}
      {renameFileModalShowing && modals.renameFile && <RenameFileModal />}
      {notFoundModalShowing && <NotFoundModal />}
      {accessDeniedNoAuthModalShowing && <AccessDeniedNoAuthModal />}
      {accessDeniedWithAuthModalShowing && <AccessDeniedWithAuthModal />}
    </>
  );
};

export default ProjectComponentLoader;
