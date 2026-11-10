import Sk from "skulpt";
import { createContext, useRef, useCallback, useEffect } from "react";
import { invalidate } from "@react-three/fiber";
import { quantisePixel, rotateInverse } from "../../utils/senseHatUtils";

export const SenseHatEmitContext = createContext(null);

export function SenseHatEmitContextProvider({ children, is3d }) {
  const subscribers = useRef(new Set());

  const subscribe = useCallback((subscriberFn) => {
    subscribers.current?.add(subscriberFn);

    return () => subscribers.current?.delete(subscriberFn);
  }, []);

  // Register a global sense_hat_emit handler that calls subscribers
  useEffect(() => {
    Sk.sense_hat_emit = (event, data) => {
      if (event === "setpixel") {
        const ledIndex = data;
        const newLedValue = quantisePixel(Sk.sense_hat.pixels[ledIndex]);
        // Update the sense hat pixels array with the quantised value, so that `get_pixels` return the correct value
        Sk.sense_hat.pixels[ledIndex] = newLedValue;

        subscribers.current.forEach((sub) =>
          sub.setPixel?.(ledIndex, newLedValue),
        );
      } else if (event === "setpixels") {
        const rotation_mapping = data;
        // rotate the pixels so that they are in framebuffer form.
        const rotatedPixels = rotateInverse(
          rotation_mapping,
          Sk.sense_hat.pixels,
        );
        // Update the sense hat pixels array with the quantised value, so that `get_pixels` returns the correct value
        Sk.sense_hat.pixels = rotatedPixels.map(quantisePixel);
        subscribers.current.forEach((sub) =>
          sub.setPixels?.(Sk.sense_hat.pixels),
        );
      }
      if (is3d) {
        invalidate();
      }
    };
  }, [is3d]);

  return (
    <SenseHatEmitContext.Provider value={subscribe}>
      {children}
    </SenseHatEmitContext.Provider>
  );
}
