/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import "react-tabs/style/react-tabs.css";
import "react-toastify/dist/ReactToastify.css";
import { useContainerQuery } from "react-container-query";
import classnames from "classnames";

import "../../../assets/stylesheets/Project.scss";
import Output from "../Output/Output";
import { showSavedMessage } from "../../../utils/Notifications";
import ProjectBar from "../../ProjectBar/ProjectBar";
import Sidebar from "../../Menus/Sidebar/Sidebar";
import EditorInput from "../EditorInput/EditorInput";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import { projContainer } from "../../../utils/containerQueries";
import ScratchContainer from "./ScratchContainer";

const Project = (props) => {
  const webComponent = useSelector((state) => state.editor.webComponent);
  const {
    nameEditable = true,
    withProjectbar = true,
    withSidebar = true,
    sidebarOptions = [],
    sidebarPlugins = [],
  } = props;
  const saving = useSelector((state) => state.editor.saving);
  const autosave = useSelector((state) => state.editor.lastSaveAutosave);
  const project = useSelector((state) => state.editor.project);
  const isCodeEditorScratchProject =
    project.project_type === "code_editor_scratch";

  useEffect(() => {
    if (saving === "success" && autosave === false) {
      showSavedMessage();
    }
  }, [saving, autosave]);

  const [params, containerRef] = useContainerQuery(projContainer);
  const [defaultWidth, setDefaultWidth] = useState("auto");
  const [defaultHeight, setDefaultHeight] = useState("auto");
  const [maxWidth, setMaxWidth] = useState("100%");
  const [handleDirection, setHandleDirection] = useState("right");
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    const isDesktop = params["width-larger-than-720"];

    setDefaultWidth(isDesktop ? "50%" : "100%");
    setDefaultHeight(isDesktop ? "100%" : "50%");
    setMaxWidth(isDesktop ? "75%" : "100%");
    setHandleDirection(isDesktop ? "right" : "bottom");
  }, [params["width-larger-than-720"]]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="proj" data-testid="project">
      <div
        className={classnames("proj-container", {
          "proj-container--wc": webComponent,
        })}
      >
        {withSidebar && (
          <Sidebar options={sidebarOptions} plugins={sidebarPlugins} />
        )}
        <div className="project-wrapper" ref={containerRef}>
          {withProjectbar && <ProjectBar nameEditable={nameEditable} />}
          {!loading && !isCodeEditorScratchProject && (
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
          )}
          {!loading && isCodeEditorScratchProject && <ScratchContainer />}
        </div>
      </div>
    </div>
  );
};

export default Project;
