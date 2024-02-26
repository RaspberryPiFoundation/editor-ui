import React, { useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { invalidate } from "@react-three/fiber";

const FlightCase = ({ setSenseHatConfig }) => {
  const { scene } = useGLTF(
    `${process.env.PUBLIC_URL}/models/raspi-compressed.glb`,
  );
  window.mod = scene;

  const blankLED = new THREE.MeshStandardMaterial({ color: `rgb(0,0,0)` });

  const [leds, setLeds] = useState({
    "0_0_0": blankLED,
  });

  const setLed = ({ led, material }) => {
    setLeds((leds) => {
      leds[led] = material;
      return leds;
    });
  };

  const setPixel = useCallback(
    (ledIndex, r, g, b) => {
      var x = ledIndex % 8;
      var y = Math.floor(ledIndex / 8);
      let ledMaterial;
      if (`${r}_${g}_${b}` in leds) {
        ledMaterial = leds[`${r}_${g}_${b}`];
      } else {
        ledMaterial = new THREE.MeshStandardMaterial({
          color: `rgb(${r},${g},${b})`,
        });
        // leds[`${r}_${g}_${b}`] = ledMaterial;
        setLed({ led: `${r}_${g}_${b}`, material: ledMaterial });
      }
      var object = scene.getObjectByName(`circle${x}_${7 - y}-1`);

      if (object != null) {
        object.material = ledMaterial;
      }
    },
    [leds, scene],
  );

  const setPixels = useCallback(
    (indexes, pix) => {
      if (indexes == null) {
        indexes = pix_map270;
      }

      var i = 0;
      for (const ledIndex of indexes) {
        setPixel(ledIndex, pix[i][0], pix[i][1], pix[i][2]);
        i += 1;
      }
    },
    [setPixel],
  );

  useEffect(() => {
    setSenseHatConfig((config) => {
      config.emit = function (event, data) {
        if (event && event === "setpixel") {
          // change the led
          const ledIndex = data;
          const ledData = config.pixels[ledIndex];

          // Convert LED-RGB to RGB565 // and then to RGB555
          config.pixels[ledIndex] = [
            ledData[0] & ~7,
            ledData[1] & ~3,
            ledData[2] & ~7,
          ];

          setPixel(
            ledIndex,
            parseInt(ledData[0] * 255),
            parseInt(ledData[1] * 255),
            parseInt(ledData[2] * 255),
          );
        } else if (event && event === "setpixels") {
          setPixels(data, config.pixels);
        }
        invalidate();
      };

      // Ensure pixels are set after the visual tab is shown. Before then, the
      // emit function above isn't registered so events are ignored.
      config.emit("setpixels");

      return config;
    });
  }, [setSenseHatConfig, setPixel, setPixels]);

  return <primitive object={scene} scale={4} />;
};

// Copied from sense_hat_blob.py. This seems to be the default rotation of the
// simulator so we should use these indexes when none are provided in setpixels.
const pix_map270 = [
  [56, 48, 40, 32, 24, 16, 8, 0],
  [57, 49, 41, 33, 25, 17, 9, 1],
  [58, 50, 42, 34, 26, 18, 10, 2],
  [59, 51, 43, 35, 27, 19, 11, 3],
  [60, 52, 44, 36, 28, 20, 12, 4],
  [61, 53, 45, 37, 29, 21, 13, 5],
  [62, 54, 46, 38, 30, 22, 14, 6],
  [63, 55, 47, 39, 31, 23, 15, 7],
].flat();

export default FlightCase;
