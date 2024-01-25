import React from "react";
import "../../assets/stylesheets/AstroPiModel.scss";
import Simulator from "./Simulator";
import AstroPiControls from "./AstroPiControls/AstroPiControls";
import OrientationPanel from "./OrientationPanel/OrientationPanel";
import { useEffect, useState } from "react";
import { resetModel, updateRTIMU } from "../../utils/Orientation";
import { useSelector } from "react-redux";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";

const AstroPiModel = ({ senseHatConfig, setSenseHatConfig }) => {
  const project = useSelector((state) => state.editor.project);
  const [orientation, setOrientation] = useState([0, 90, 0]);
  const resetOrientation = (e) => {
    resetModel(e);
    setOrientation([0, 90, 0]);
  };

  const defaultPressure = 1013;
  const defaultTemperature = 13;
  const defaultHumidity = 45;

  useEffect(() => {
    if (!senseHatConfig) {
      setSenseHatConfig({
        emit: () => {}, // Overridden by FlightCase.jsx
        colour: "#FF00A4",
        gamma: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        low_light: false,
        motion: false,
        mz_criteria: { ...defaultMZCriteria },
        pixels: new Array(64).fill([0, 0, 0]),
        rtimu: {
          pressure: [
            1,
            defaultPressure + Math.random() - 0.5,
          ] /* isValid, pressure*/,
          temperature: [
            1,
            defaultTemperature + Math.random() - 0.5,
          ] /* isValid, temperature */,
          humidity: [
            1,
            defaultHumidity + Math.random() - 0.5,
          ] /* isValid, humidity */,
          gyro: [0, 0, 0] /* all 3 gyro values */,
          accel: [0, 0, 0] /* all 3 accel values */,
          compass: [0, 0, 33] /* all compass values */,
          raw_orientation: [0, 90, 0],
        },
        sensestick: {
          _eventQueue: [],
          off: () => {},
          once: () => {},
        },
        start_motion_callback: () => {},
        stop_motion_callback: () => {},
      });
    }
  }, [senseHatConfig, setSenseHatConfig]);

  useEffect(() => {
    setSenseHatConfig((config) => ({
      ...config,
      mz_criteria: { ...defaultMZCriteria },
    }));
  }, [project, setSenseHatConfig]);

  useEffect(() => {
    setSenseHatConfig((config) => ({
      ...config,
      rtimu: updateRTIMU({ ...config.rtimu, raw_orientation: orientation }),
    }));
  }, [orientation, setSenseHatConfig]);

  return senseHatConfig && (
    <div className="sense-hat">
      <div className="sense-hat-model">
        <Simulator
          updateOrientation={setOrientation}
          setSenseHatConfig={setSenseHatConfig}
        />
        <OrientationPanel
          orientation={orientation}
          resetOrientation={resetOrientation}
        />
      </div>

      {/* <!-- Full sensor controls --> */}
      <AstroPiControls
        pressure={defaultPressure}
        temperature={defaultTemperature}
        humidity={defaultHumidity}
        colour={senseHatConfig.colour}
        motion={senseHatConfig.motion}
        senseHatConfig={senseHatConfig}
        setSenseHatConfig={setSenseHatConfig}
      />
    </div>
  );
};

export default AstroPiModel;
