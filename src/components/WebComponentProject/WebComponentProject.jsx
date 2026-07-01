import React, { useEffect, useRef } from "react";
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
import {
  endRunEventCycle,
  handleRunEndedForEventCycle,
  scheduleRunEventCycle,
} from "./runEventCodeSnapshot";
import {
  getPrevCodeRunTriggered,
  setPrevCodeRunTriggered,
  syncRunEventTrackingProject,
} from "./runEventTrackingState";

export { resetCodeRunEventTracking } from "./runEventTrackingState";

const WebComponentProject = ({
  withProjectbar = false,
  nameEditable = false,
  editableInstructions = false,
  withSidebar = false,
  sidebarOptions = [],
  outputOnly = false,
  outputPanels = ["text", "visual"],
  outputSplitView = false,
  feedbackFormUrl,
  sidebarPlugins = [],
}) => {
  const loading = useSelector((state) => state.editor.loading);
  const project = useSelector((state) => state.editor.project);
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier,
  );
  const projectType = useSelector((state) => state.editor.project.project_type);

  const isExperienceCSScratchProject = project.project_type === "scratch";
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );

  const error = useSelector((state) => state.editor.error) ?? "";
  const errorDetails = useSelector((state) => state.editor.errorDetails);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const projectComponents = useSelector(
    (state) => state.editor.project.components,
  );
  const readOnly = useSelector((state) => state.editor.readOnly);
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
  const dispatch = useDispatch();
  const renderer = new marked.Renderer();

  const buildRunCompletedPayloadRef = useRef(() => ({}));
  buildRunCompletedPayloadRef.current = () => {
    const mz_criteria = Sk.sense_hat
      ? Sk.sense_hat.mz_criteria
      : { ...defaultMZCriteria };

    return outputOnly
      ? {
          errorDetails,
          step: currentStepPosition,
          projectIdentifier,
          projectType,
        }
      : {
          isErrorFree: error === "",
          step: currentStepPosition,
          errorDetails,
          friendlyErrorShown: Boolean(friendlyError?.html),
          projectIdentifier,
          projectType,
          ...mz_criteria,
        };
  };

  useEffect(() => {
    dispatch(setIsSplitView(outputSplitView));
    dispatch(setWebComponent(true));
    dispatch(setInstructionsEditable(editableInstructions));
    dispatch(setIsOutputOnly(outputOnly));
  }, [editableInstructions, outputSplitView, outputOnly, dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      document.dispatchEvent(codeChangedEvent({ step: currentStepPosition }));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [project, currentStepPosition]);

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
    syncRunEventTrackingProject(projectIdentifier, codeRunTriggered);
  }, [projectIdentifier, codeRunTriggered]);

  useEffect(() => {
    const wasTriggered = getPrevCodeRunTriggered();

    if (codeRunTriggered && !wasTriggered) {
      scheduleRunEventCycle(
        projectIdentifier,
        projectComponents,
        { bypassSnapshot: readOnly },
        {
          onRunStarted: () => {
            document.dispatchEvent(
              runStartedEvent({
                step: currentStepPosition,
                projectIdentifier,
                projectType,
              }),
            );
          },
          onRunCompletedIfRunAlreadyEnded: () => {
            document.dispatchEvent(
              runCompletedEvent(buildRunCompletedPayloadRef.current()),
            );
          },
        },
      );
    }

    if (!codeRunTriggered && wasTriggered) {
      handleRunEndedForEventCycle({
        onRunCompleted: () => {
          document.dispatchEvent(
            runCompletedEvent(buildRunCompletedPayloadRef.current()),
          );
        },
      });

      endRunEventCycle();
    }

    setPrevCodeRunTriggered(codeRunTriggered);
  }, [
    codeRunTriggered,
    outputOnly,
    error,
    errorDetails,
    friendlyError,
    currentStepPosition,
    projectIdentifier,
    projectType,
    readOnly,
    projectComponents,
  ]);

  useEffect(() => {
    document.dispatchEvent(stepChangedEvent(currentStepPosition));
  }, [currentStepPosition]);

  if (isExperienceCSScratchProject) {
    return;
  }

  return (
    <>
      {!outputOnly &&
        (isMobile && projectType !== "code_editor_scratch" ? (
          <MobileProject
            withSidebar={withSidebar}
            sidebarOptions={sidebarOptions}
            feedbackFormUrl={feedbackFormUrl}
            sidebarPlugins={sidebarPlugins}
          />
        ) : (
          <Project
            nameEditable={nameEditable}
            withProjectbar={withProjectbar}
            withSidebar={withSidebar}
            sidebarOptions={sidebarOptions}
            feedbackFormUrl={feedbackFormUrl}
            sidebarPlugins={sidebarPlugins}
          />
        ))}
      {outputOnly && (
        <div className="embedded-viewer" data-testid="output-only">
          {loading === "success" && <Output outputPanels={outputPanels} />}
        </div>
      )}
    </>
  );
};

export default WebComponentProject;
