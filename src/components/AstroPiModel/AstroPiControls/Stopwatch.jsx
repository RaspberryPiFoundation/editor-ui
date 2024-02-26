import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useStopwatch } from "react-timer-hook";

const Stopwatch = ({ setSenseHatConfig }) => {
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const { seconds, minutes, isRunning, pause, reset } = useStopwatch({
    autoStart: false,
  });
  const [hasLostFocus, setHasLostFocus] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    window.addEventListener("blur", () => {
      setHasLostFocus(true);
    });
  }, []);

  useEffect(() => {
    if (codeRunTriggered && !isRunning) {
      setHasLostFocus(false);
      reset();
    }
    if (!codeRunTriggered && isRunning) {
      pause();
      setSenseHatConfig((config) => {
        const duration = hasLostFocus ? null : minutes * 60 + seconds;
        config.mz_criteria.duration = duration;
        return config;
      });
    }
  }, [
    codeRunTriggered,
    hasLostFocus,
    minutes,
    seconds,
    isRunning,
    pause,
    reset,
    setSenseHatConfig,
  ]);

  return (
    <div className="sense-hat-controls-panel__container sense-hat-controls-panel__container-timer">
      <label
        className="sense-hat-controls-panel__control-name"
        htmlFor="sense_hat_timer"
      >
        {t("output.senseHat.controls.timer")}
      </label>
      <span
        className="sense-hat-controls-panel__control-reading sense-hat-controls-panel__control-reading-timer"
        id="sense_hat_timer"
      >
        <span>{String(minutes).padStart(2, "0")}</span>:
        <span>{String(seconds).padStart(2, "0")}</span>
      </span>
    </div>
  );
};

export default Stopwatch;
