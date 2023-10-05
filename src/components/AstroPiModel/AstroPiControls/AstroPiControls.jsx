import React from "react";
import Input from "./Input";
import MotionInput from "./MotionInput";
import SliderInput from "./SliderInput";
import "../../../assets/stylesheets/AstroPiModel.scss";
import Stopwatch from "./Stopwatch";
import { HumidityIcon, PressureIcon, TemperatureIcon } from "../../../Icons";
import { useTranslation } from "react-i18next";

const AstroPiControls = (props) => {
  const { temperature, pressure, humidity, colour, motion } = props;
  const { t } = useTranslation();

  return (
    <div className="sense-hat-controls">
      <h2 className="sense-hat-controls-heading">
        {t("output.senseHat.controls.name")}
      </h2>
      <div className="sense-hat-controls-panel">
        <div className="sense-hat-controls-panel__sliders">
          <SliderInput
            name="temperature"
            label={t("output.senseHat.controls.temperature")}
            unit="°C"
            min={-40}
            max={120}
            defaultValue={temperature}
            Icon={TemperatureIcon}
          />
          <SliderInput
            name="pressure"
            label={t("output.senseHat.controls.pressure")}
            unit="hPa"
            min={260}
            max={1260}
            defaultValue={pressure}
            Icon={PressureIcon}
          />
          <SliderInput
            name="humidity"
            label={t("output.senseHat.controls.humidity")}
            unit="%"
            min={0}
            max={100}
            defaultValue={humidity}
            Icon={HumidityIcon}
          />
        </div>

        <div className="sense-hat-controls-panel__control sense-hat-controls-panel__control-last">
          <Input
            name="colour"
            label={t("output.senseHat.controls.colour")}
            type="color"
            defaultValue={colour}
          />
          <MotionInput defaultValue={motion} />
          <Stopwatch />
        </div>
      </div>
    </div>
  );
};

export default AstroPiControls;
