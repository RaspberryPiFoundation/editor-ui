import { useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import Sk from "skulpt";
import { invalidate } from "@react-three/fiber";
import { quantisePixel } from "../../utils/senseHatUtils";
import { rotateInverse } from "../../utils/senseHatUtils";

export const REGISTRY_ID = "3D";

const FlightCase = ({ senseHatEmitRegistryRef }) => {
  const { scene } = useGLTF(
    `${process.env.ASSETS_URL}/models/raspi-compressed.glb`,
  );

  useEffect(() => {
    if (import.meta.env.DEV) {
      window.mod = scene;
    }

    // Helper functions

    function setPixel(ledIndex, r, g, b) {
      const x = ledIndex % 8;
      const y = Math.floor(ledIndex / 8);
      const object = scene.getObjectByName(`circle${x}_${7 - y}-1`);

      if (object && object.material) {
        object.material.color.setRGB(r / 255, g / 255, b / 255);
      }
    }

    function setPixels(_, pix) {
      for (let ledIndex = 0; ledIndex < 64; ledIndex += 1) {
        setPixel(
          ledIndex,
          pix[ledIndex][0],
          pix[ledIndex][1],
          pix[ledIndex][2],
        );
      }
    }

    // Initialise the LED array materials so they are not shared
    for (let i = 0; i < 64; i++) {
      const x = i % 8;
      const y = Math.floor(i / 8);
      const object = scene.getObjectByName(`circle${x}_${7 - y}-1`);
      if (object?.material) {
        const [r, g, b] = [0, 0, 0];
        object.material = new THREE.MeshStandardMaterial({
          color: `rgb(${r},${g},${b})`,
        });
        object.userData.isCustomLED = true;
      }
    }

    // Copy the pixel map from Sk.sense_hat.pixels
    if (Sk?.sense_hat?.pixels) {
      setPixels(null, Sk.sense_hat.pixels);
    }

    const registry = senseHatEmitRegistryRef?.current;
    if (registry) {
      registry[REGISTRY_ID] = function (event, data) {
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
          const rotatedPixels = rotateInverse(
            rotation_mapping,
            Sk.sense_hat.pixels,
          );
          // Update the sense hat pixels array with the quantised value, so that `get_pixels` returns the correct value
          Sk.sense_hat.pixels = rotatedPixels.map(quantisePixel);
          setPixels(data, Sk.sense_hat.pixels);
        }
        invalidate();
      };
    }
    return () => {
      if (registry) delete registry[REGISTRY_ID];

      delete window.mod;

      // remove the allocated materials
      for (let i = 0; i < 64; i++) {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const object = scene.getObjectByName(`circle${x}_${7 - y}-1`);
        if (object?.material && object.userData.isCustomLED) {
          object.material.dispose();
          delete object.userData.isCustomLED;
        }
      }
    };
  }, [scene, senseHatEmitRegistryRef]);

  return <primitive object={scene} scale={4} />;
};

export default FlightCase;
