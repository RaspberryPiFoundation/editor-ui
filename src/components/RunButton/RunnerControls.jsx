import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import Button from "../Button/Button";
import RunIcon from "../../assets/icons/run.svg";
import StopIcon from "../../assets/icons/stop.svg";
import { stopCodeRun, stopDraw, triggerCodeRun } from "../../redux/EditorSlice";
import { runStoppedEvent } from "../../events/WebComponentCustomEvents";
import "../../assets/stylesheets/RunnerControls.scss?inline";

const RunnerControls = ({ embedded = false, skinny = false }) => {
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const codeRunLoading = useSelector((state) => state.editor.codeRunLoading);
  const activeRunner = useSelector((state) => state.editor.activeRunner);
  const loadedRunner = useSelector((state) => state.editor.loadedRunner);
  const saving = useSelector((state) => state.editor.saving);
  const lastSaveAutosave = useSelector(
    (state) => state.editor.lastSaveAutosave,
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [stopping, setStopping] = useState(false);
  const buttonRef = useRef();

  const isRunning = codeRunTriggered || drawTriggered;

  useEffect(() => {
    if (!codeRunStopped) {
      setStopping(false);
      return;
    }
    const timeout = setTimeout(() => setStopping(true), 100);
    return () => clearTimeout(timeout);
  }, [codeRunStopped]);

  useEffect(() => {
    if (saving !== "success" || lastSaveAutosave) return;

    const button = buttonRef.current;
    const focusLost =
      !document.activeElement || document.activeElement === document.body;
    if (button && focusLost) {
      button.focus();
    }
  }, [saving, lastSaveAutosave]);

  const onClickRun = () => {
    if (window.plausible) {
      window.plausible(`Run button${embedded ? " embedded" : ""}`);
    }
    dispatch(triggerCodeRun());
  };

  const onClickStop = () => {
    if (stopping) {
      return;
    }
    if (window.plausible) {
      window.plausible(`Stop button${embedded ? " embedded" : ""}`);
    }
    document.dispatchEvent(runStoppedEvent({ embedded }));
    if (codeRunTriggered) {
      dispatch(stopCodeRun());
    }
    dispatch(stopDraw());
  };

  let buttonText = t("runButton.run");
  if (isRunning) {
    buttonText = t(stopping ? "runButton.stopping" : "runButton.stop");
  }

  return (
    <div className="runner-controls">
      <Button
        buttonText={buttonText}
        buttonRef={buttonRef}
        ButtonIcon={isRunning ? (stopping ? null : StopIcon) : RunIcon}
        buttonIconPosition="right"
        buttonOuter={skinny}
        className={classNames("btn--primary", {
          "btn--run": !isRunning,
          "btn--stop": isRunning,
          "btn--small": skinny,
        })}
        disabled={
          !isRunning &&
          (!activeRunner || activeRunner !== loadedRunner || codeRunLoading)
        }
        ariaDisabled={isRunning && stopping}
        onClickHandler={isRunning ? onClickStop : onClickRun}
      />
    </div>
  );
};

export default RunnerControls;
