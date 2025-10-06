import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { marked } from "marked";

import "../../assets/stylesheets/Project.scss";
import "../../assets/stylesheets/EmbeddedViewer.scss";
import Project from "../Editor/Project/Project";
import MobileProject from "../Mobile/MobileProject/MobileProject";
import Output from "../Editor/Output/Output";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import Sk from "skulpt";
import {
  setIsSplitView,
  setWebComponent,
  setIsOutputOnly,
  setInstructionsEditable,
} from "../../redux/EditorSlice";
import { setInstructions } from "../../redux/InstructionsSlice";
import { MOBILE_MEDIA_QUERY } from "../../utils/mediaQueryBreakpoints";
import {
  codeChangedEvent,
  projectIdentifierChangedEvent,
  runCompletedEvent,
  runStartedEvent,
  stepChangedEvent,
} from "../../events/WebComponentCustomEvents";

const WebComponentProject = ({
  withProjectbar = false,
  nameEditable = false,
  editableInstructions = false,
  withSidebar = false,
  sidebarOptions = [],
  outputOnly = false,
  outputPanels = ["text", "visual"],
  outputSplitView = false,
  plugins = [],
}) => {
  const loading = useSelector((state) => state.editor.loading);
  const project = useSelector((state) => state.editor.project);
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier,
  );
  const isScratchProject = project.project_type === "scratch";
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );

  const error = useSelector((state) => state.editor.error);
  const errorDetails = useSelector((state) => state.editor.errorDetails);
  const codeHasBeenRun = useSelector((state) => state.editor.codeHasBeenRun);
  const projectInstructions = useSelector(
    (state) => state.editor.project.instructions,
  );
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const permitInstructionsOverride = useSelector(
    (state) => state.instructions.permitOverride,
  );
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const [codeHasRun, setCodeHasRun] = useState(codeHasBeenRun);
  const dispatch = useDispatch();
  const renderer = new marked.Renderer();

  useEffect(() => {
    dispatch(setIsSplitView(outputSplitView));
    dispatch(setWebComponent(true));
    dispatch(setInstructionsEditable(editableInstructions));
    dispatch(setIsOutputOnly(outputOnly));
  }, [editableInstructions, outputSplitView, outputOnly, dispatch]);

  useEffect(() => {
    setCodeHasRun(false);
    const timeout = setTimeout(() => {
      document.dispatchEvent(codeChangedEvent);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    if (projectIdentifier) {
      document.dispatchEvent(projectIdentifierChangedEvent(projectIdentifier));
    }
  }, [projectIdentifier]);

  renderer.link = function (data) {
    return `<a href="${data.href}" target="_blank" rel="noreferrer"
    }">${data.text}</a>`;
  };

  marked.setOptions({
    renderer: renderer,
  });

  useEffect(() => {
    if (!permitInstructionsOverride) return;

    dispatch(
      setInstructions({
        project: {
          steps:
            typeof projectInstructions === "string"
              ? [
                  {
                    quiz: false,
                    title: "",
                    content: marked.parse(projectInstructions),
                  },
                ]
              : [],
        },
        permitOverride: true,
      }),
    );
  }, [dispatch, projectInstructions, permitInstructionsOverride]);

  useEffect(() => {
    if (codeRunTriggered) {
      document.dispatchEvent(runStartedEvent);
      setCodeHasRun(true);
    } else if (codeHasRun) {
      const mz_criteria = Sk.sense_hat
        ? Sk.sense_hat.mz_criteria
        : { ...defaultMZCriteria };

      const payload = outputOnly
        ? { errorDetails }
        : { isErrorFree: error === "", ...mz_criteria };

      document.dispatchEvent(runCompletedEvent(payload));
    }
  }, [codeRunTriggered, codeHasRun, outputOnly, error, errorDetails]);

  useEffect(() => {
    document.dispatchEvent(stepChangedEvent(currentStepPosition));
  }, [currentStepPosition]);

  return (
    <>
      {!isScratchProject && (
        <>
          {!outputOnly &&
            (isMobile ? (
              <MobileProject
                withSidebar={withSidebar}
                sidebarOptions={sidebarOptions}
                plugins={plugins}
              />
            ) : (
              <Project
                nameEditable={nameEditable}
                withProjectbar={withProjectbar}
                withSidebar={withSidebar}
                sidebarOptions={sidebarOptions}
                plugins={plugins}
              />
            ))}
          {outputOnly && (
            <div className="embedded-viewer" data-testid="output-only">
              {loading === "success" && <Output outputPanels={outputPanels} />}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default WebComponentProject;
