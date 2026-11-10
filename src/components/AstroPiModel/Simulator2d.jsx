import Sk from "skulpt";
import { useState, useCallback } from "react";
import { rotationClockwise90degrees } from "../../utils/senseHatUtils";
import { useTranslation } from "react-i18next";
import { rotate } from "../../utils/senseHatUtils";
import useSenseHatRenderer from "./useSenseHatRenderer";

const Simulator2d = () => {
  const { t } = useTranslation();

  const [pixels, setPixels] = useState(
    Sk.sense_hat.pixels || Array(64).fill([0, 0, 0]),
  );
  const setPixel = useCallback(
    (ledIndex, rgb) => {
      const newPixels = [...pixels];
      newPixels[ledIndex] = rgb;
      setPixels(newPixels);
    },
    [pixels, setPixels],
  );

  useSenseHatRenderer({
    setPixel,
    setPixels,
  });

  return (
    <>
      <div
        role="img"
        className="sense-hat-model-2d"
        aria-label={t("output.senseHat.view.description")}
      >
        <div className="sense-hat-model-2d-matrix" aria-hidden="true">
          {
            // The div elements are ordered left to right-top to
            // bottom, but the SenseHAT is ordered top to
            // bottom-right to left in its default orientation
            // (i.e. rotation=0). Hence, the div indexes need to be
            // rotated 90 degrees clockwise.
            rotate(rotationClockwise90degrees, pixels).map(([r, g, b], i) => {
              const key = `led-${i}`;
              return (
                <div
                  className="sense-hat-model-2d-matrix__led-housing"
                  key={key}
                  data-testid={key}
                >
                  <div
                    className="sense-hat-model-2d-matrix__led-bulb"
                    data-testid={`${key}-bulb`}
                    style={{
                      backgroundColor: `rgb(${r} ${g} ${b})`,
                    }}
                  />
                </div>
              );
            })
          }
        </div>
      </div>
    </>
  );
};
export default Simulator2d;
