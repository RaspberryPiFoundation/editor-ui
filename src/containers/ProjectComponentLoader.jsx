import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProject } from "../hooks/useProject";
import { useEmbeddedMode } from "../hooks/useEmbeddedMode";
import { useMediaQuery } from "react-responsive";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "../utils/mediaQueryBreakpoints";

import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../redux/EditorSlice";
import { isOwner } from "../utils/projectHelpers";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";

import Project from "../components/Editor/Project/Project";
import MobileProject from "../components/Mobile/MobileProject/MobileProject";
import NewFileModal from "../components/Modals/NewFileModal";
import NotFoundModal from "../components/Modals/NotFoundModal";
import AccessDeniedNoAuthModal from "../components/Modals/AccessDeniedNoAuthModal";
import AccessDeniedWithAuthModal from "../components/Modals/AccessDeniedWithAuthModal";
import RenameFileModal from "../components/Modals/RenameFileModal";

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user);
  const accessToken = user ? user.access_token : null;
  const project = useSelector((state) => state.editor.project);
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const hasShownSavePrompt = useSelector(
    (state) => state.editor.hasShownSavePrompt,
  );

  const modals = useSelector((state) => state.editor.modals);
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
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  useEmbeddedMode(embedded);
  useProject({ projectIdentifier: identifier, accessToken: accessToken });

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      navigate(`/${i18n.language}/projects/${project.identifier}`);
    }
    if (loading === "failed") {
      navigate("/");
    }
  }, [loading, project, i18n.language, navigate]);

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

  return (
    <>
      {loading === "success" ? (
        isMobile ? (
          <MobileProject />
        ) : (
          <Project />
        )
      ) : loading === "pending" ? (
        <p>{t("project.loading")}</p>
      ) : null}
      {newFileModalShowing ? <NewFileModal /> : null}
      {renameFileModalShowing && modals.renameFile ? <RenameFileModal /> : null}
      {notFoundModalShowing ? <NotFoundModal /> : null}
      {accessDeniedNoAuthModalShowing ? <AccessDeniedNoAuthModal /> : null}
      {accessDeniedWithAuthModalShowing ? <AccessDeniedWithAuthModal /> : null}
    </>
  );
};

export default ProjectComponentLoader;
