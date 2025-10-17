import React from "react";
import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from "react-redux";

import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/RunnerControls.scss";

const RunnerControls = ({ embedded = false, skinny = false }) => {
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const { t } = useTranslation();

  return (
    <div className="runner-controls">
      {codeRunTriggered || drawTriggered ? (
        <StopButton
          embedded={embedded}
          text={t("runButton.stop")}
          icon="stop"
          iconPosition="right"
          // buttonOuter={skinny}
          // className={`btn--stop btn--primary${skinny ? " btn--small" : ""}`}
        />
      ) : (
        <RunButton
          embedded={embedded}
          text={t("runButton.run")}
          icon="play_arrow"
          iconPosition="right"
          // buttonOuter={skinny}
          // className={skinny ? "btn--small" : ""}
        />
      )}
    </div>
  );
};

export default RunnerControls;
