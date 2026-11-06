import "../../assets/stylesheets/AstroPiModel.scss?inline";
import Simulator from "./Simulator";
import Simulator2d from "./Simulator2d";
import Sk from "skulpt";
import AstroPiControls from "./AstroPiControls/AstroPiControls";
import OrientationPanel from "./OrientationPanel/OrientationPanel";
import ViewModeControls from "./ViewModeControls";
import { useEffect, useState } from "react";
import { resetModel, updateRTIMU } from "../../utils/Orientation";
import { useSelector } from "react-redux";
import { defaultMZCriteria } from "../../utils/DefaultMZCriteria";
import { rotate, rotationClockwise90degrees } from "../../utils/senseHatUtils";

const B = [207, 207, 207];
const W = [235, 235, 235];
const SMILEY_FACE = rotate(
  rotationClockwise90degrees,
  // prettier-ignore
  [
    B, B, B, B, B, B, B, W,
    B, B, B, B, B, B, B, B,
    W, W, W, B, B, W, W, W,
    W, B, W, B, B, W, B, W,
    W, W, W, B, B, W, W, W,
    B, B, B, B, B, B, B, B,
    B, B, W, B, B, W, B, B,
    B, B, W, W, W, W, B, B
  ],
);

const AstroPiModel = ({ initialIs3d = true }) => {
  const project = useSelector((state) => state.editor.project);
  const [is3d, setIs3d] = useState(initialIs3d);
  const [orientation, setOrientation] = useState([0, 90, 0]);
  const resetOrientation = (e) => {
    resetModel(e);
    setOrientation([0, 90, 0]);
  };
  // Registry that both the 2d and 3d views can subscribe to (
  // using unique ids) in order to run their own
  // Sk.sense_hat_emit event listeners.
  // Used to avoid race conditions when switching from
  // 3d to 2d view (or vice-versa).
  const senseHatEmitRegistryRef = useRef({});

  const defaultPressure = 1013;
  const defaultTemperature = 13;
  const defaultHumidity = 45;

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
    Sk.sense_hat.pixels = SMILEY_FACE;
  }

  useEffect(() => {
    Sk.sense_hat.mz_criteria = { ...defaultMZCriteria };
  }, [project]);

  useEffect(() => {
    Sk.sense_hat.rtimu.raw_orientation = orientation;
    updateRTIMU();
  }, [orientation]);

  useEffect(() => {
    Sk.sense_hat_emit = (event, data) => {
      const listeners = senseHatEmitRegistryRef.current;
      if (listeners) {
        for (let listener of Object.values(listeners)) {
          listener(event, data);
        }
      }
    };
    return () => {
      Sk.sense_hat_emit = null;
    };
  }, [senseHatEmitRegistryRef]);

  return (
    <div className="sense-hat">
      <div className="sense-hat-model">
        <>
          {is3d && (
            <>
              <Simulator
                updateOrientation={setOrientation}
                senseHatEmitRegistryRef={senseHatEmitRegistryRef}
              />
              <OrientationPanel
                orientation={orientation}
                resetOrientation={resetOrientation}
              />
            </>
          )}
          <ViewModeControls is3d={is3d} setIs3d={setIs3d} />
          {!is3d && (
            <Simulator2d senseHatEmitRegistryRef={senseHatEmitRegistryRef} />
          )}
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
