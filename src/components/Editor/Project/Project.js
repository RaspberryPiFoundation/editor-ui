/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "react-tabs/style/react-tabs.css";
import "react-toastify/dist/ReactToastify.css";
import { useContainerQuery } from "react-container-query";
import classnames from "classnames";

import "./Project.scss";
import Output from "../Output/Output";
import RenameFile from "../../Modals/RenameFile";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../EditorSlice";
import { isOwner } from "../../../utils/projectHelpers";
import NotFoundModal from "../../Modals/NotFoundModal";
import AccessDeniedNoAuthModal from "../../Modals/AccessDeniedNoAuthModal";
import AccessDeniedWithAuthModal from "../../Modals/AccessDeniedWithAuthModal";
import {
  showLoginPrompt,
  showSavedMessage,
  showSavePrompt,
} from "../../../utils/Notifications";
import ProjectBar from "../../ProjectBar/ProjectBar";
import Sidebar from "../../Menus/Sidebar/Sidebar";
import EditorInput from "../EditorInput/EditorInput";
import NewFileModal from "../../Modals/NewFileModal";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import { projContainer } from "../../../utils/containerQueries";
import MobileProject from "../../Mobile/MobileProject/MobileProject";

const Project = (props) => {
  const dispatch = useDispatch();
  const { forWebComponent } = props;
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
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
  const justLoaded = useSelector((state) => state.editor.justLoaded);
  const hasShownSavePrompt = useSelector(
    (state) => state.editor.hasShownSavePrompt,
  );
  const saving = useSelector((state) => state.editor.saving);
  const autosave = useSelector((state) => state.editor.lastSaveAutosave);

  useEffect(() => {
    if (saving === "success" && autosave === false) {
      showSavedMessage();
    }
  }, [saving, autosave]);

  useEffect(() => {
    if (forWebComponent) {
      return;
    }
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
  }, [dispatch, forWebComponent, project, user]);

  const [params, containerRef] = useContainerQuery(projContainer);
  const [defaultWidth, setDefaultWidth] = useState("auto");
  const [defaultHeight, setDefaultHeight] = useState("auto");
  const [maxWidth, setMaxWidth] = useState("100%");
  const [handleDirection, setHandleDirection] = useState("right");

  useMemo(() => {
    const isDesktop = params["width-larger-than-880"];

    setDefaultWidth(isDesktop ? "50%" : "100%");
    setDefaultHeight(isDesktop ? "100%" : "50%");
    setMaxWidth(isDesktop ? "75%" : "100%");
    setHandleDirection(isDesktop ? "right" : "bottom");
  }, [params]);

  return (
    <div className="proj">
      <MobileProject />
      <div
        ref={containerRef}
        className={classnames("proj-container", "proj-container--desktop", {
          "proj-container--wc": forWebComponent,
        })}
      >
        {!forWebComponent ? <Sidebar /> : null}
        <div className="project-wrapper">
          {!forWebComponent ? <ProjectBar /> : null}
          <div className="proj-editor-wrapper">
            <ResizableWithHandle
              data-testid="proj-editor-container"
              className="proj-editor-container"
              defaultWidth={defaultWidth}
              defaultHeight={defaultHeight}
              handleDirection={handleDirection}
              minWidth="25%"
              maxWidth={maxWidth}
            >
              <EditorInput />
            </ResizableWithHandle>
            <Output />
          </div>
        </div>
      </div>
      {newFileModalShowing ? <NewFileModal /> : null}
      {renameFileModalShowing && modals.renameFile ? <RenameFile /> : null}
      {notFoundModalShowing ? <NotFoundModal /> : null}
      {accessDeniedNoAuthModalShowing ? <AccessDeniedNoAuthModal /> : null}
      {accessDeniedWithAuthModalShowing ? <AccessDeniedWithAuthModal /> : null}
    </div>
  );
};

export default Project;
