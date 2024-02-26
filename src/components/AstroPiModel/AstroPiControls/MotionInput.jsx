import React from "react";
import { useEffect, useState, startTransition } from "react";
import { useSelector } from "react-redux";
import Toggle from "react-toggle";
import "../../../assets/stylesheets/AstroPiModel.scss";
import "react-toggle/style.css";
import { useTranslation } from "react-i18next";

const MotionInput = ({ defaultValue, senseHatConfig, setSenseHatConfig }) => {
  const [value, setValue] = useState(defaultValue);
  const codeRunTriggered = useSelector((s) => s.editor.codeRunTriggered);
  const { t } = useTranslation();

  useEffect(() => {
    if (!codeRunTriggered) {
      setSenseHatConfig((config) => {
        config.start_motion_callback = () => {};
        config.stop_motion_callback = () => {};
        return config;
      });
    }
  }, [codeRunTriggered, setSenseHatConfig]);

  useEffect(() => {
    startTransition(() => {
      setSenseHatConfig((config) => {
        config.motion = value;
        return config;
      });
    });

    value
      ? senseHatConfig.start_motion_callback()
      : senseHatConfig.stop_motion_callback();
  }, [value, setSenseHatConfig, senseHatConfig]);

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
