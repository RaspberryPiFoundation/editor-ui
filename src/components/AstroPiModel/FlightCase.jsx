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
      const ledData = Sk.sense_hat.pixels[ledIndex];

      // Convert LED-RGB to RGB565 // and then to RGB555
      Sk.sense_hat.pixels[ledIndex] = [
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
      setPixels(data, Sk.sense_hat.pixels);
    }
    invalidate();
  };

  return <primitive object={scene} scale={4} />;
};

export default FlightCase;
