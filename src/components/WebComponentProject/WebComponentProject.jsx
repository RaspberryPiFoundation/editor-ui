import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { useMediaQuery } from "react-responsive";
import Style from "style-it";

import internalStyles from "../../assets/stylesheets/InternalStyles.scss";
import externalStyles from "../../assets/stylesheets/ExternalStyles.scss";
import "../../assets/stylesheets/EmbeddedViewer.scss";
import "../../assets/stylesheets/Project.scss";

import Project from "../Editor/Project/Project";
import MobileProject from "../Mobile/MobileProject/MobileProject";
import Output from "../Editor/Output/Output";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import Sk from "skulpt";
import { setIsSplitView, setWebComponent } from "../../redux/EditorSlice";
import { MOBILE_MEDIA_QUERY } from "../../utils/mediaQueryBreakpoints";
import {
  codeChangedEvent,
  runCompletedEvent,
  runStartedEvent,
  stepChangedEvent,
} from "../../events/WebComponentCustomEvents";

const WebComponentProject = ({
  withSidebar = false,
  sidebarOptions = [],
  outputOnly = false,
}) => {
  const loading = useSelector((state) => state.editor.loading);
  const project = useSelector((state) => state.editor.project);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const error = useSelector((state) => state.editor.error);
  const codeHasBeenRun = useSelector((state) => state.editor.codeHasBeenRun);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const [cookies] = useCookies(["theme", "fontSize"]);
  const defaultTheme = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const [codeHasRun, setCodeHasRun] = useState(codeHasBeenRun);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setIsSplitView(false));
    dispatch(setWebComponent(true));
  }, [dispatch]);

  console.log(`outputOnly: ${outputOnly}`);

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
      <style>{externalStyles.toString()}</style>
      <Style>
        {internalStyles.toString()}
        <div id="wc" className={`--${cookies.theme || defaultTheme}`}>
          {!outputOnly &&
            (isMobile ? (
              <MobileProject
                withSidebar={withSidebar}
                sidebarOptions={sidebarOptions}
              />
            ) : (
              <Project
                forWebComponent={true}
                withSidebar={withSidebar}
                sidebarOptions={sidebarOptions}
              />
            ))}
          {outputOnly && (
            <div className="embedded-viewer">
              {loading === "success" ? (
                <Output embedded={true} browserPreview={false} />
              ) : null}
            </div>
          )}
        </div>
      </Style>
    </>
  );
};

export default WebComponentProject;
