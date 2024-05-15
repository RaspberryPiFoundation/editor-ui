import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

import Project from "../Editor/Project/Project";
import MobileProject from "../Mobile/MobileProject/MobileProject";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import Sk from "skulpt";
import { setIsSplitView, setWebComponent } from "../../redux/EditorSlice";
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
  withSidebar = false,
  sidebarOptions = [],
}) => {
  const project = useSelector((state) => state.editor.project);
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier,
  );
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const error = useSelector((state) => state.editor.error);
  const codeHasBeenRun = useSelector((state) => state.editor.codeHasBeenRun);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const [codeHasRun, setCodeHasRun] = useState(codeHasBeenRun);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setIsSplitView(false));
    dispatch(setWebComponent(true));
  }, [dispatch]);

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

  useEffect(() => {
    if (codeRunTriggered) {
      document.dispatchEvent(runStartedEvent);
      setCodeHasRun(true);
    } else if (codeHasRun) {
      const mz_criteria = Sk.sense_hat
        ? Sk.sense_hat.mz_criteria
        : { ...defaultMZCriteria };
      document.dispatchEvent(
        runCompletedEvent({
          isErrorFree: error === "",
          ...mz_criteria,
        }),
      );
    }
  }, [codeRunTriggered, codeHasRun, error]);

  useEffect(() => {
    document.dispatchEvent(stepChangedEvent(currentStepPosition));
  }, [currentStepPosition]);

  return (
    <>
      {isMobile ? (
        <MobileProject
          withSidebar={withSidebar}
          sidebarOptions={sidebarOptions}
        />
      ) : (
        <Project
          projectNameReadonly={true}
          withProjectbar={withProjectbar}
          withSidebar={withSidebar}
          sidebarOptions={sidebarOptions}
        />
      )}
    </>
  );
};

export default WebComponentProject;
