import { useCallback, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import Sk from "skulpt";
import useSenseHatRenderer from "./useSenseHatRenderer";

const FlightCase = () => {
  const { scene } = useGLTF(
    `${process.env.ASSETS_URL}/models/raspi-compressed.glb`,
  );

  const setPixel = useCallback(
    (ledIndex, rgb) => {
      const [r, g, b] = rgb;
      const x = ledIndex % 8;
      const y = Math.floor(ledIndex / 8);
      const object = scene.getObjectByName(`circle${x}_${7 - y}-1`);

      if (object && object.material) {
        object.material.color.setRGB(
          r / 255,
          g / 255,
          b / 255,
          THREE.SRGBColorSpace,
        );
      }
    },
    [scene],
  );

  const setPixels = useCallback(
    (pixels) => {
      for (let ledIndex = 0; ledIndex < 64; ledIndex += 1) {
        setPixel(ledIndex, pixels[ledIndex]);
      }
    },
    [setPixel],
  );

  useSenseHatRenderer({
    setPixel,
    setPixels,
  });

  // Initialise the LED array materials so they are not shared
  const initialise3dLeds = useCallback(() => {
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
  }, [scene]);

  // remove the allocated materials
  const teardown3dLeds = useCallback(() => {
    for (let i = 0; i < 64; i++) {
      const x = i % 8;
      const y = Math.floor(i / 8);
      const object = scene.getObjectByName(`circle${x}_${7 - y}-1`);
      if (object?.material && object.userData.isCustomLED) {
        object.material.dispose();
        delete object.userData.isCustomLED;
      }
    }
  }, [scene]);

  useEffect(() => {
    window.mod = scene;

    initialise3dLeds();

    // Copy the pixel map from Sk.sense_hat.pixels
    if (Sk?.sense_hat?.pixels) {
      setPixels(Sk.sense_hat.pixels);
    }

    return () => {
      delete window.mod;
      teardown3dLeds();
    };
  }, [initialise3dLeds, scene, setPixel, setPixels, teardown3dLeds]);

  return <primitive object={scene} scale={4} />;
};

export default FlightCase;
