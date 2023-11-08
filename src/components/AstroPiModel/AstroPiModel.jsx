import React from "react";
import "../../assets/stylesheets/AstroPiModel.scss";
import Simulator from "./Simulator";
import Sk from "skulpt";
import AstroPiControls from "./AstroPiControls/AstroPiControls";
import OrientationPanel from "./OrientationPanel/OrientationPanel";
import { useEffect, useState } from "react";
import { resetModel, updateRTIMU } from "../../utils/Orientation";
import { useSelector } from "react-redux";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";

const AstroPiModel = () => {
  const project = useSelector((state) => state.editor.project);
  const [orientation, setOrientation] = useState([0, 90, 0]);
  const resetOrientation = (e) => {
    resetModel(e);
    setOrientation([0, 90, 0]);
  };

  const defaultPressure = 1013;
  const defaultTemperature = 13;
  const defaultHumidity = 45;

  if (!Sk.sense_hat) {
    Sk.sense_hat = {
      colour: "#FF00A4",
      gamma: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
      low_light: false,
      motion: false,
      mz_criteria: { ...defaultMZCriteria },
      pixels: [],
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
    };
    for (var i = 0; i < 64; i++) {
      Sk.sense_hat.pixels.push([0, 0, 0]);
    }
  }

  useEffect(() => {
    Sk.sense_hat.mz_criteria = { ...defaultMZCriteria };
  }, [project]);

  useEffect(() => {
    Sk.sense_hat.rtimu.raw_orientation = orientation;
    updateRTIMU();
  }, [orientation]);

  return (
    <div className="sense-hat">
      <div className="sense-hat-model">
        <Simulator updateOrientation={setOrientation} />
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
        colour={Sk.sense_hat.colour}
        motion={Sk.sense_hat.motion}
      />
    </div>
  );
};

export default AstroPiModel;
