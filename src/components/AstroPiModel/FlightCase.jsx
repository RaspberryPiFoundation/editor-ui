import { useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import Sk from "skulpt";
import { invalidate } from "@react-three/fiber";
import { quantisePixel } from "../../utils/senseHatUtils";
import { rotate } from "../../utils/senseHatUtils";

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

  function setPixels(_, pix) {
    for (let ledIndex = 0; ledIndex < 64; ledIndex += 1) {
      setPixel(ledIndex, pix[ledIndex][0], pix[ledIndex][1], pix[ledIndex][2]);
    }
  }

  useEffect(() => {
    // copy the pixel map from Sk.sense_hat.pixels
    setPixels(null, Sk.sense_hat.pixels);
  }, []);

  Sk.sense_hat_emit = function (event, data) {
    if (event && event === "setpixel") {
      // change the led
      const ledIndex = data;
      const ledData = quantisePixel(Sk.sense_hat.pixels[ledIndex]);
      // Update the sense hat pixels array with the quantised value, so that `get_pixels` returns the correct value
      Sk.sense_hat.pixels[ledIndex] = ledData;

      setPixel(ledIndex, ledData[0], ledData[1], ledData[2]);
    } else if (event && event === "setpixels") {
      const rotation_mapping = data;
      // rotate the pixels so that they are in framebuffer form.
      const rotatedPixels = rotate(rotation_mapping, Sk.sense_hat.pixels);
      // Update the sense hat pixels array with the quantised value, so that `get_pixels` returns the correct value
      Sk.sense_hat.pixels = rotatedPixels.map(quantisePixel);
      setPixels(data, Sk.sense_hat.pixels);
    }
    invalidate();
  };

  return <primitive object={scene} scale={4} />;
};

export default FlightCase;
