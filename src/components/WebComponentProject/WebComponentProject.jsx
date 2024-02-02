import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

import Project from "../Editor/Project/Project";
import MobileProject from "../Mobile/MobileProject/MobileProject";
import Output from "../Editor/Output/Output";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import Sk from "skulpt";
import {
  setIsSplitView,
  setWebComponent,
  setIsOutputOnly,
} from "../../redux/EditorSlice";
import { MOBILE_MEDIA_QUERY } from "../../utils/mediaQueryBreakpoints";
import {
  codeChangedEvent,
  runCompletedEvent,
  runStartedEvent,
  stepChangedEvent,
} from "../../events/WebComponentCustomEvents";

const WebComponentProject = ({
  withProjectbar = false,
  withSidebar = false,
  sidebarOptions = [],
  outputOnly = false,
  outputPanels = ["text", "visual"],
}) => {
  const loading = useSelector((state) => state.editor.loading);
  const project = useSelector((state) => state.editor.project);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );

  const error = useSelector((state) => state.editor.error);
  const errorDetails = useSelector((state) => state.editor.errorDetails);
  const codeHasBeenRun = useSelector((state) => state.editor.codeHasBeenRun);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const [codeHasRun, setCodeHasRun] = useState(codeHasBeenRun);
  const dispatch = useDispatch();

  dispatch(setIsSplitView(false));
  dispatch(setWebComponent(true));
  dispatch(setIsOutputOnly(outputOnly));

  useEffect(() => {
    setCodeHasRun(false);
    const timeout = setTimeout(() => {
      document.dispatchEvent(codeChangedEvent);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [project]);

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
      {!outputOnly &&
        (isMobile ? (
          <MobileProject
            withSidebar={withSidebar}
            sidebarOptions={sidebarOptions}
          />
        ) : (
          <Project
            forWebComponent={true}
            withProjectbar={withProjectbar}
            withSidebar={withSidebar}
            sidebarOptions={sidebarOptions}
          />
        ))}
      {outputOnly && (
        <div className="embedded-viewer">
          {loading === "success" && (
            <Output
              embedded={true}
              browserPreview={false}
              outputPanels={outputPanels}
            />
          )}
        </div>
      )}
    </>
  );
};

export default WebComponentProject;
