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
  const [timeoutId, setTimeoutId] = React.useState(null);
  const webComponent = document.querySelector("editor-wc");
  const [codeHasRun, setCodeHasRun] = React.useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setIsSplitView(false));
  }, [dispatch]);

  useEffect(() => {
    setCodeHasRun(false);
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(function () {
      const customEvent = new CustomEvent("codeChanged", {
        bubbles: true,
        cancelable: false,
        composed: true,
      });
      webComponent.dispatchEvent(customEvent);
    }, 2000);

    setTimeoutId(id);
  }, [project, webComponent]);

  useEffect(() => {
    if (codeRunTriggered) {
      const runStartedEvent = new CustomEvent("runStarted", {
        bubbles: true,
        cancelable: false,
        composed: true,
      });
      webComponent.dispatchEvent(runStartedEvent);
      setCodeHasRun(true);
    } else if (codeHasRun) {
      const state = store.getState();
      const mz_criteria = Sk.sense_hat
        ? Sk.sense_hat.mz_criteria
        : { ...defaultMZCriteria };
      const runCompletedEvent = new CustomEvent("runCompleted", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          isErrorFree: state.editor.error === "",
          ...mz_criteria,
        },
      });
      webComponent.dispatchEvent(runCompletedEvent);
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
