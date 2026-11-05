import Sk from "skulpt";
import { useState, useEffect } from "react";
import {
  quantisePixel,
  rotationClockwise90degrees,
} from "../../utils/senseHatUtils";
import { useTranslation } from "react-i18next";

const Simulator2d = () => {
  const { t } = useTranslation();

  const [pixels, setPixels] = useState(
    Sk.sense_hat.pixels || Array(64).fill([0, 0, 0]),
  );

  useEffect(() => {
    Sk.sense_hat_emit = function (event, data) {
      if (event && event === "setpixel") {
        const index = data;
        const newValue = quantisePixel(Sk.sense_hat.pixels[index]);
        // Copy from Sk.sense_hat.pixels since it gets
        // reset on every run and therefore may be vastly different
        // from the current pixels state.
        const newPixels = [...Sk.sense_hat.pixels];
        newPixels[index] = newValue;
        Sk.sense_hat.pixels[index] = newValue;
        setPixels(newPixels);
      } else if (event && event === "setpixels") {
        const pixelBuffer = new Array(64);
        (data ?? Array.from({ length: 64 }, (_, i) => i)).forEach((rotated_i, i) => {
          pixelBuffer[rotated_i] = quantisePixel(Sk.sense_hat.pixels[i]);
        });
        Sk.sense_hat.pixels = pixelBuffer;
        setPixels(pixelBuffer);
      }
    };
    return () => {
      Sk.sense_hat_emit = null;
    };
  }, []);

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
            rotationClockwise90degrees.map((i) => {
              const [r, g, b] = pixels[i];
              return (
                <div
                  className="sense-hat-model-2d-matrix__led-housing"
                  key={`led-${i}`}
                >
                  <div
                    className="sense-hat-model-2d-matrix__led-bulb"
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
