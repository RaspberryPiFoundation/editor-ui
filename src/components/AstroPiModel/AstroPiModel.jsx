import "../../assets/stylesheets/AstroPiModel.scss?inline";
import Simulator from "./Simulator";
import Simulator2d from "./Simulator2d";
import Sk from "skulpt";
import AstroPiControls from "./AstroPiControls/AstroPiControls";
import OrientationPanel from "./OrientationPanel/OrientationPanel";
import { useEffect, useState } from "react";
import { resetModel, updateRTIMU } from "../../utils/Orientation";
import { useSelector } from "react-redux";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import { useTranslation } from "react-i18next";

const ProjectionPanel = ({ is3d, setIs3d }) => {
  const target = is3d ? "2D" : "3D";
  const { t } = useTranslation();
  // const label = t("output.senseHat.toggleTo2d")
  // const label = t("output.senseHat.toggleTo2d")
  // name={t("output.senseHat.model.roll")}
  const label = `Switch to ${target} view`;
  return (
    <div
      className="sense-hat-projection-panel"
      aria-label={label}
      style={{
        position: "absolute",
        width: "100%",
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          flex: "1",
          margin: "calc(0.5rem * var(--scale-factor, 1))",
        }}
      >
        <button
          style={{
            backgroundColor: "white",
            zIndex: "1",
            width: "32px",
            height: "32px",
            borderRadius: "5px",
            textAlign: "center",
            border: "1px solid white",
          }}
          onClick={() => setIs3d((x) => !x)}
        >
          {target}
        </button>
      </div>
    </div>
  );
};

const AstroPiModel = () => {
  const project = useSelector((state) => state.editor.project);
  const [is3d, setIs3d] = useState(false);
  const [orientation, setOrientation] = useState([0, 90, 0]);
  const resetOrientation = (e) => {
    resetModel(e);
    setOrientation([0, 90, 0]);
  };

  const defaultPressure = 1013;
  const defaultTemperature = 13;
  const defaultHumidity = 45;

  // TODO pixels state lives here so that both 2d and 3d share state.

  if (!Sk.sense_hat) {
    Sk.sense_hat = {
      colour: "#FF0000",
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
    // TODO add panel for 2d -> 3d
    <div className="sense-hat">
      <div className="sense-hat-model">
        <>
          <ProjectionPanel is3d={is3d} setIs3d={setIs3d} />
          {is3d && (
            <>
              <Simulator updateOrientation={setOrientation} />
              <OrientationPanel
                orientation={orientation}
                resetOrientation={resetOrientation}
              />
            </>
          )}
          {!is3d && <Simulator2d />}
        </>
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
