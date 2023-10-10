import React from "react";
import { useEffect, useState, startTransition } from "react";
import { useSelector } from "react-redux";
import Toggle from "react-toggle";
import Sk from "skulpt";
import "../../../assets/stylesheets/AstroPiModel.scss";
import "react-toggle/style.css";
import { useTranslation } from "react-i18next";

const MotionInput = (props) => {
  const { defaultValue } = props;
  const [value, setValue] = useState(defaultValue);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (!codeRunTriggered) {
      Sk.sense_hat.start_motion_callback = () => {};
      Sk.sense_hat.stop_motion_callback = () => {};
    }
  }, [codeRunTriggered]);

  useEffect(() => {
    if (Sk.sense_hat) {
      startTransition(() => {
        Sk.sense_hat.motion = value;
      });
    }
    value
      ? Sk.sense_hat.start_motion_callback()
      : Sk.sense_hat.stop_motion_callback();
  }, [value]);

  return (
    <div className="sense-hat-controls-panel__container">
      <label
        className="sense-hat-controls-panel__control-name"
        htmlFor={`sense_hat_motion`}
      >
        {t("output.senseHat.controls.motion")}
      </label>
      <div className="sense-hat-controls-panel__control-toggle">
        <label htmlFor={`sense_hat_motion`}>
          {t("output.senseHat.controls.motionSensorOptions.no")}
        </label>
        <Toggle
          id="sense_hat_motion"
          icons={false}
          checked={value}
          onChange={(e) => setValue(e.target.checked)}
        />
        <label htmlFor={`sense_hat_motion`}>
          {t("output.senseHat.controls.motionSensorOptions.yes")}
        </label>
      </div>
    </div>
  );
};

export default MotionInput;
