/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import "react-tabs/style/react-tabs.css";
import "react-toastify/dist/ReactToastify.css";
import { useContainerQuery } from "react-container-query";
import classnames from "classnames";
import { compose } from "redux";
import { setAppElement } from "react-modal";

import "../../../assets/stylesheets/Project.scss";
import Output from "../Output/Output";
import { showSavedMessage } from "../../../utils/Notifications";
import ProjectBar from "../../ProjectBar/ProjectBar";
import Sidebar from "../../Menus/Sidebar/Sidebar";
import EditorInput from "../EditorInput/EditorInput";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import { projContainer } from "../../../utils/containerQueries";

import GUI, { AppStateHOC } from "@RaspberryPiFoundation/scratch-gui";
import ScratchIntegrationHOC from "./ScratchIntegrationHOC";
import Button from "../../Button/Button";

const WrappedGui = compose(AppStateHOC, ScratchIntegrationHOC)(GUI);
// const WrappedGUI = AppStateHOC(GUI);

const Project = (props) => {
  const webComponent = useSelector((state) => state.editor.webComponent);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set app element to document body to avoid shadow DOM issues
    setAppElement(document.body);
    setIsReady(true);
  }, []);

  const {
    nameEditable = true,
    withProjectbar = true,
    withSidebar = true,
    sidebarOptions = [],
    sidebarPlugins = [],
  } = props;
  const saving = useSelector((state) => state.editor.saving);
  const autosave = useSelector((state) => state.editor.lastSaveAutosave);

  useEffect(() => {
    if (saving === "success" && autosave === false) {
      showSavedMessage();
    }
  }, [saving, autosave]);

  // const [params, containerRef] = useContainerQuery(projContainer);
  // const [defaultWidth, setDefaultWidth] = useState("auto");
  // const [defaultHeight, setDefaultHeight] = useState("auto");
  // const [maxWidth, setMaxWidth] = useState("100%");
  // const [handleDirection, setHandleDirection] = useState("right");
  const [loading, setLoading] = useState(true);
  const [containerReady, setContainerReady] = useState(false);

  // useMemo(() => {
  //   const isDesktop = params["width-larger-than-720"];

  //   setDefaultWidth(isDesktop ? "50%" : "100%");
  //   setDefaultHeight(isDesktop ? "100%" : "50%");
  //   setMaxWidth(isDesktop ? "75%" : "100%");
  //   setHandleDirection(isDesktop ? "right" : "bottom");
  // }, [params["width-larger-than-720"]]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    // Set the app element for React Modal to the root of your web component
    const appRoot =
      document.querySelector("editor-wc")?.shadowRoot?.querySelector("#root") ||
      document.getElementById("root");
    if (appRoot) {
      setAppElement(appRoot);
    }
  }, []);

  if (!isReady) {
    return <div>Loading Scratch Editor...</div>;
  }

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
        <Button
          buttonText="Upload Project"
          onClickHandler={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".sb3";
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                // const reader = new FileReader();
                // reader.onload = (event) => {
                //   const arrayBuffer = event.target.result;
                //   // Dispatch action to load project using the arrayBuffer
                //   // e.g., dispatch(loadProject(arrayBuffer));

                // };
                // reader.readAsArrayBuffer(file);
                console.log("posting message to upload file...", file);
                // window.postMessage("scratch-gui-upload", { file: file });
                window.postMessage(
                  { type: "scratch-gui-upload", file: file },
                  window.location.origin,
                );
              }
            };
            input.click();
          }}
          type="primary"
        />
        <WrappedGui
          locale="en"
          menuBarHidden={true}
          projectId="blank-scratch-starter"
          projectHost="http://localhost:3009/api/projects"
          assetHost="https://editor-scratch.raspberrypi.org/api/assets"

          // assetHost="/api/assets"
          // basePath="/scratch-gui/"
        />
        {/* <WrappedGui
          // projectId={projectId}
          locale={"en"}
          menuBarHidden={true}
          projectHost={"/api/projects"}
          assetHost={"/api/assets"}
          basePath={"/scratch-gui/"}
          onUpdateProjectId={() => {}}
          onShowCreatingRemixAlert={() => {}}
          onShowRemixSuccessAlert={() => {}}
          onShowSavingAlert={() => {}}
          onShowSaveSuccessAlert={() => {}}
        /> */}
        {/* <div className="project-wrapper" ref={containerRef}>
          {withProjectbar && <ProjectBar nameEditable={nameEditable} />}
          {!loading && (
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
        </div> */}
      </div>
    </div>
  );
};

export default Project;
