import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

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
import { MOBILE_MEDIA_QUERY } from "../../utils/mediaQueryBreakpoints";
import { projectHasChangedSinceInitialLoad } from "../../utils/projectHelpers";
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
import useAiHintOffered from "../../hooks/useAiHintOffered";

export { resetCodeRunEventTracking } from "./runEventTrackingState";

const WebComponentProject = ({
  locale = "en",
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
  const initialComponents = useSelector(
    (state) => state.editor.initialComponents,
  );
  const initialProjectName = useSelector(
    (state) => state.editor.initialProjectName,
  );
  const initialProjectInstructions = useSelector(
    (state) => state.editor.initialProjectInstructions,
  );

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
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const aiHintOffered = useAiHintOffered();
  const dispatch = useDispatch();

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
          aiHintOffered,
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

  // This component only mounts once a project has loaded, so the first
  // codeChanged event after mount is caused by the load itself. Flag it so
  // hosts can tell it apart from a user edit. The content check stops an edit
  // made within the debounce window from being reported as the load.
  //
  // The snapshot is read through a ref rather than used as an effect dep:
  // every save resyncs it with a fresh array, and that alone must not restart
  // the debounce and fire an event when nothing changed.
  const initialSnapshotRef = useRef();
  initialSnapshotRef.current = {
    components: initialComponents,
    name: initialProjectName,
    instructions: initialProjectInstructions,
  };
  const hasDispatchedCodeChangedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const snapshot = initialSnapshotRef.current;
      const isInitialLoad =
        !hasDispatchedCodeChangedRef.current &&
        !projectHasChangedSinceInitialLoad(project, snapshot.components, {
          initialName: snapshot.name,
          initialInstructions: snapshot.instructions,
        });
      hasDispatchedCodeChangedRef.current = true;
      document.dispatchEvent(
        codeChangedEvent({ step: currentStepPosition, isInitialLoad }),
      );
    }, 2000);
    return () => clearTimeout(timeout);
  }, [project, currentStepPosition]);

  useEffect(() => {
    if (projectIdentifier) {
      document.dispatchEvent(projectIdentifierChangedEvent(projectIdentifier));
    }
  }, [projectIdentifier]);

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
            locale={locale}
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
