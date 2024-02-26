import React from "react";
import "../../assets/stylesheets/AstroPiModel.scss";
import Simulator from "./Simulator";
import AstroPiControls from "./AstroPiControls/AstroPiControls";
import OrientationPanel from "./OrientationPanel/OrientationPanel";
import { useEffect, useState } from "react";
import { resetModel, updateRTIMU } from "../../utils/Orientation";
import { useSelector } from "react-redux";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import {
  defaultHumidity,
  defaultPressure,
  defaultSenseHatConfig,
  defaultTemperature,
} from "../../utils/defaultSenseHatConfig";

const AstroPiModel = ({ senseHatConfig, setSenseHatConfig }) => {
  const project = useSelector((state) => state.editor.project);
  const [orientation, setOrientation] = useState([0, 90, 0]);
  const resetOrientation = (e) => {
    resetModel(e);
    setOrientation([0, 90, 0]);
  };

  useEffect(() => {
    if (!senseHatConfig) {
      setSenseHatConfig(defaultSenseHatConfig);
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

  return (
    senseHatConfig && (
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
    )
  );
};

export default AstroPiModel;
