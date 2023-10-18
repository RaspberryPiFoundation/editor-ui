import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { useMediaQuery } from "react-responsive";
import Style from "style-it";
import internalStyles from "../../assets/stylesheets/InternalStyles.scss";
import externalStyles from "../../assets/stylesheets/ExternalStyles.scss";

import Project from "../Editor/Project/Project";
import MobileProject from "../Mobile/MobileProject/MobileProject";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import Sk from "skulpt";
import store from "../../app/store";
import { setIsSplitView } from "../../redux/EditorSlice";
import { MOBILE_MEDIA_QUERY } from "../../utils/mediaQueryBreakpoints";
import {
  codeChangedEvent,
  runCompletedEvent,
  runStartedEvent,
} from "../../events/WebComponentCustomEvents";

const WebComponentProject = () => {
  const project = useSelector((state) => state.editor.project);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const [cookies] = useCookies(["theme", "fontSize"]);
  const defaultTheme = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const webComponent = document.querySelector("editor-wc");
  const [codeHasRun, setCodeHasRun] = React.useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setIsSplitView(false));
  }, [dispatch]);

  useEffect(() => {
    setCodeHasRun(false);
    const timeout = setTimeout(() => {
      webComponent.dispatchEvent(codeChangedEvent);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [project, webComponent]);

  useEffect(() => {
    if (codeRunTriggered) {
      webComponent.dispatchEvent(runStartedEvent);
      setCodeHasRun(true);
    } else if (codeHasRun) {
      const state = store.getState();
      const mz_criteria = Sk.sense_hat
        ? Sk.sense_hat.mz_criteria
        : { ...defaultMZCriteria };
      webComponent.dispatchEvent(
        runCompletedEvent({
          isErrorFree: state.editor.error === "",
          ...mz_criteria,
        }),
      );
    }
  }, [codeRunTriggered, codeHasRun, webComponent]);

  return (
    <>
      <style>{externalStyles.toString()}</style>
      <Style>
        {internalStyles}
        <div
          id="wc"
          className={`--${cookies.theme || defaultTheme} font-size-${
            cookies.fontSize || "small"
          }`}
        >
          {isMobile ? (
            <MobileProject forWebComponent={true} />
          ) : (
            <Project forWebComponent={true} />
          )}
        </div>
      </Style>
    </>
  );
};

export default WebComponentProject;
