import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { marked } from "marked";

import inlineCodeAttributes from "../../utils/inlineCodeAttributes";
import "../../assets/stylesheets/Project.scss?inline";
import "../../assets/stylesheets/EmbeddedViewer.scss?inline";
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

// Teach marked to understand kramdown inline attribute lists on code spans
// (e.g. `Looks`{:class="block3looks"}) so editable instructions match the
// server's kramdown rendering. Registered once at module load.
marked.use({ extensions: [inlineCodeAttributes] });

// Editable instructions are authored as a single markdown document; a step
// boundary is signified by a `<br class="page-break" />` marker (the final
// step needs no trailing marker). Splitting on it yields one step per section.
const PAGE_BREAK_REGEX = /<br\s+class=["']page-break["']\s*\/?>/i;

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

    let steps = [];
    if (typeof projectInstructions === "string") {
      const sections = projectInstructions
        .split(PAGE_BREAK_REGEX)
        .map((section) => section.trim());
      // Drop blank sections (e.g. a stray trailing page break), but always keep
      // at least one step so the editing experience is preserved for empty
      // input.
      const nonEmpty = sections.filter((section) => section.length > 0);
      const stepMarkdown = nonEmpty.length > 0 ? nonEmpty : [""];
      steps = stepMarkdown.map((content) => ({
        quiz: false,
        title: "",
        content: marked.parse(content),
      }));
    }

    dispatch(
      setInstructions({
        project: { steps },
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
