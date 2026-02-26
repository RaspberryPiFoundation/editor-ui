import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import Sk from "skulpt";
import { invalidate } from "@react-three/fiber";

const FlightCase = () => {
  const { scene } = useGLTF(
    `${process.env.ASSETS_URL}/models/raspi-compressed.glb`,
  );
  window.mod = scene;

  const blankLED = new THREE.MeshStandardMaterial({ color: `rgb(0,0,0)` });
  var leds = {
    "0_0_0": blankLED,
  };

  // Convert to RGB565
  function quantisePixel(pixel) {
    return [pixel[0] & ~7, pixel[1] & ~3, pixel[2] & ~7]
  }

  function setPixel(ledIndex, r, g, b) {
    var x = ledIndex % 8;
    var y = Math.floor(ledIndex / 8);

    let ledMaterial;
    if (`${r}_${g}_${b}` in leds) {
      ledMaterial = leds[`${r}_${g}_${b}`];
    } else {
      ledMaterial = new THREE.MeshStandardMaterial({
        color: `rgb(${r},${g},${b})`,
      });
      leds[`${r}_${g}_${b}`] = ledMaterial;
    }
    var object = scene.getObjectByName(`circle${x}_${7 - y}-1`);

    if (object != null) {
      object.material = ledMaterial;
    }
  }

  function setPixels(indexes, pix) {
    if (indexes == null) {
      indexes = Array.from(Array(8 * 8).keys());
    }

    var i = 0;
    for (const ledIndex of indexes) {
      setPixel(ledIndex, pix[i][0], pix[i][1], pix[i][2]);
      i += 1;
    }
  }

  Sk.sense_hat_emit = function (event, data) {
    if (event && event === "setpixel") {
      // change the led
      const ledIndex = data;
      const ledData = quantisePixel(Sk.sense_hat.pixels[ledIndex]);
      // Update the sense hat pixels array with the quantised value, so that `get_pixels` returns the correct value
      Sk.sense_hat.pixels[ledIndex] = ledData;

      setPixel(
        ledIndex,
        ledData[0],
        ledData[1],
        ledData[2],
      );
    } else if (event && event === "setpixels") {
      // Update the sense hat pixels array with the quantised value, so that `get_pixels` returns the correct value
      Sk.sense_hat.pixels.forEach((pixel, i) => {
        Sk.sense_hat.pixels[i] = quantisePixel(pixel);
      });

      setPixels(data, Sk.sense_hat.pixels);
    }
    invalidate();
  };

  return <primitive object={scene} scale={4} />;
};

export default FlightCase;
