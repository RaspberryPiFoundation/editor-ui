import Sk from "skulpt";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/** Iterate through the pixels in the correct order -
 * Sk.sense_hat.pixels stores the bottom-most, left-most element
 * at index 0.
 */
const getIndices = () => {
  const indices = [];
  // i-th row, j-th column
  for (let i = 7; i >= 0; i--) {
    for (let j = 0; j < 8; j++) {
      indices.push(i * 8 + j);
    }
  }
  return indices;
};
const indices = getIndices();

// const rgbEquals = (rgb1, rgb2) => {
//   console.log(`Array.isArray(rgb1): ${Array.isArray(rgb1)}`);
//   console.log(`Array.isArray(rgb2): ${Array.isArray(rgb2)}`);
//   console.log(`rgb1.length === rgb2.length: ${rgb1.length === rgb2.length}`);

//   return (
//     Array.isArray(rgb1) &&
//     Array.isArray(rgb2) &&
//     rgb1.length === rgb2.length &&
//     rgb1.every((val, index) => val === rgb2[index])
//   );
// };

const Simulator2d = () => {
  const [pixels, setPixels] = useState(Array(64).fill([0, 0, 0]));
  const pixelsRef = useRef(pixels);
  // const { t } = useTranslation();

  // const label = t("output.senseHat.model2d")
  // const label = t("output.senseHat.toggleTo2d")
  // name={t("output.senseHat.model.roll")}

  // TODO move to central location
  // Quantise RGB components to RGB565 step sizes
  function quantisePixel(pixel) {
    return [pixel[0] & ~7, pixel[1] & ~3, pixel[2] & ~7];
  }

  useEffect(() => {
    Sk.sense_hat_emit = function (event, data) {
      if (event && event === "setpixel") {
        const index = data;
        const newValue = quantisePixel(Sk.sense_hat.pixels[index]);
        const newPixels = [...pixelsRef.current];
        newPixels[index] = newValue;
        pixelsRef.current = newPixels;
        setPixels(newPixels);
      } else if (event && event === "setpixels") {
        const newPixels = Sk.sense_hat.pixels.map(quantisePixel);
        pixelsRef.current = newPixels;
        setPixels(newPixels);
      }
    };
    return () => {
      Sk.sense_hat_emit = null;
    };
  }, []);

  return (
    // TODO move to stylesheet
    <div
      role="img"
      aria-label="2D view of the Astro Pi 8 by 8 Sense HAT LED matrix"
      style={{
        display: "flex",
        justifyContent: "center",
        // alignContent: "center",
        paddingTop: "0.5rem",
        // height: "100%",
        // width: "100%",
        flex: "1",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          gap: "10px",
          // padding: "0.5em",
          aspectRatio: "1 / 1",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
        className="sense-hat-led-matrix-2d"
        aria-hidden="true"
      >
        {indices.map((i) => {
          const [r, g, b] = pixels[i];
          return (
            <div
              key={`led-${i}`}
              className="led"
              style={{
                backgroundColor: `rgb(${r} ${g} ${b})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
export default Simulator2d;
