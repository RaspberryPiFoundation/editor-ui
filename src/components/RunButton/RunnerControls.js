import React from "react";
import RunButton from "./RunButton";
import StopButton from "./StopButton";
import { useSelector } from "react-redux";
import { RunIcon, StopIcon } from "../../Icons";
import { useTranslation } from "react-i18next";

const RunnerControls = () => {
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const { t } = useTranslation();

  return codeRunTriggered || drawTriggered ? (
    <StopButton
      buttonText={t("runButton.stop")}
      ButtonIcon={StopIcon}
      buttonIconPosition="right"
    />
  ) : (
    <RunButton
      buttonText={t("runButton.run")}
      ButtonIcon={RunIcon}
      buttonIconPosition="right"
    />
  );
};

export default RunnerControls;
