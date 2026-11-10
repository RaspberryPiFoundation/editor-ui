import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { SenseHatEmitContext } from "./SenseHatEmitContext";

export function useSenseHatRenderer(handlers) {
  const subscribe = useContext(SenseHatEmitContext);

  const handlersRef = useRef(handlers);

  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const subscriberProxy = {
      setPixel: (index, color) => handlersRef.current.setPixel?.(index, color),
      setPixels: (pixels) => handlersRef.current.setPixels?.(pixels),
    };
    const unsubscribe = subscribe(subscriberProxy);

    return unsubscribe;
  }, [subscribe]);
}
export default useSenseHatRenderer;
