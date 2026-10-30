import Sk from "skulpt";
import { useState, useEffect } from "react";
import {
  quantisePixel,
  rotationClockwise90degrees,
} from "../../utils/senseHatUtils";
import { useTranslation } from "react-i18next";

const Simulator2d = () => {
  const [pixels, setPixels] = useState(
    Sk.sense_hat.pixels || Array(64).fill([0, 0, 0]),
  );

  // const { t } = useTranslation();

  // const label = t("output.senseHat.model2d")
  // const label = t("output.senseHat.toggleTo2d")
  // name={t("output.senseHat.model.roll")}

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
        setPixels(newPixels);
      } else if (event && event === "setpixels") {
        if (data === null) return;
        const pixelBuffer = new Array(64);
        data.forEach((rotated_i, i) => {
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

  const gridBackgroundColor = "darkgrey";
  const cellBackgroundColor = "#c9cacd";

  return (
    // TODO move to stylesheet
    <>
      <div
        role="img"
        aria-label="2D view of the Astro Pi 8 by 8 Sense HAT LED matrix"
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "0.5rem",
          flex: "1",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: "1%",
            display: "grid",
            backgroundColor: gridBackgroundColor,
            gridTemplateColumns: "repeat(8, 1fr)",
            gridTemplateRows: "repeat(8, 1fr)",
            gap: "1%",
            aspectRatio: "1 / 1",
            maxHeight: "100%",
            maxWidth: "100%",
          }}
          className="sense-hat-led-matrix-2d"
          aria-hidden="true"
        >
          {
            // The div elements are ordered left to right-top to
            // bottom, but the SenseHAT is ordered top to
            // bottom-right to left in its default orientation
            // (i.e. rotation=0). Hence, the divs need to be
            // rotated 90 degrees clockwise.
            rotationClockwise90degrees.map((i) => {
              const [r, g, b] = pixels[i];
              return (
                <div
                  key={`led-${i}`}
                  style={{
                    display: "flex",
                    backgroundColor: cellBackgroundColor,
                    borderWidth: "2px 2px 2px 1px",
                    borderStyle: "solid",
                    justifyContent: "center",
                    alignItems: "center",
                    borderTopColor: "#cfcfcf",
                    borderLeftColor: "lightgrey",
                    borderBottomColor: "#cfcfcf",
                    borderRightColor: "grey",
                  }}
                >
                  <div
                    className="led"
                    style={{
                      boxSizing: "border-box",
                      height: "90%",
                      width: "90%",
                      // controls the led circle
                      borderWidth: "0.5px",
                      borderStyle: "solid",
                      borderColor: "grey",
                      borderRadius: "50%",
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
