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

const Project = (props) => {
  const { forWebComponent } = props;
  const saving = useSelector((state) => state.editor.saving);
  const autosave = useSelector((state) => state.editor.lastSaveAutosave);

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
  const [flexDirection, setFlexDirection] = useState("column");

  useMemo(() => {
    const isDesktop = params["width-larger-than-880"];

    setDefaultWidth(isDesktop ? "50%" : "100%");
    setDefaultHeight(isDesktop ? "100%" : "50%");
    setMaxWidth(isDesktop ? "75%" : "100%");
    setHandleDirection(isDesktop ? "right" : "bottom");
    setFlexDirection(isDesktop ? "row" : "column");
  }, [params["width-larger-than-880"]]);

  return (
    <div className="proj">
      <div
        ref={containerRef}
        className={classnames("proj-container", {
          "proj-container--wc": forWebComponent,
        })}
      >
        {!forWebComponent && <Sidebar />}
        <div className="project-wrapper">
          {!forWebComponent ? <ProjectBar /> : null}
          <div className="proj-editor-wrapper" style={{ flexDirection }}>
            <ResizableWithHandle
              data-testid="proj-editor-container"
              className="proj-editor-container"
              defaultWidth={defaultWidth}
              minHeight={defaultHeight}
              handleDirection={handleDirection}
              minWidth="25%"
              maxWidth={maxWidth}
            >
              <EditorInput />
            </ResizableWithHandle>
            <Output
              panelDirection={flexDirection}
              defaultWidth={defaultWidth}
              minHeight={defaultHeight}
              minWidth="25%"
              maxWidth={maxWidth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
