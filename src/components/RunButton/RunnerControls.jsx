import React from "react";
import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from "react-redux";
import RunIcon from "../../assets/icons/run.svg";
import StopIcon from "../../assets/icons/stop.svg";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/RunnerControls.scss";

const RunnerControls = ({ embedded = false, skinny = false }) => {
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const { t } = useTranslation();

  return (
    <div className="runner-controls">
      {codeRunTriggered || drawTriggered ? (
        <StopButton
          embedded={embedded}
          buttonText={t("runButton.stop")}
          ButtonIcon={StopIcon}
          buttonIconPosition="right"
          buttonOuter={skinny}
          className={`btn--stop btn--primary${skinny ? " btn--small" : ""}`}
        />
      ) : (
        <RunButton
          embedded={embedded}
          buttonText={t("runButton.run")}
          ButtonIcon={RunIcon}
          buttonIconPosition="right"
          buttonOuter={skinny}
          className={skinny ? "btn--small" : "run-btn"}
        />
      )}
    </div>
  );
};

export default RunnerControls;
