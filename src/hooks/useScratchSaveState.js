import { useEffect, useRef, useState } from "react";
import { postMessageToScratchIframe } from "../utils/scratchIframe";

const SCRATCH_SAVE_LABEL_KEYS = {
  idle: "header.save",
  saving: "saveStatus.saving",
  saved: "saveStatus.saved",
};
const SCRATCH_SAVE_RESET_DELAY_MS = 5000;

export const useScratchSaveState = ({ enabled = false } = {}) => {
  const scratchSaveResetTimeoutRef = useRef(null);
  const [scratchSaveState, setScratchSaveState] = useState("idle");

  useEffect(() => {
    const clearScratchSaveResetTimeout = () => {
      if (scratchSaveResetTimeoutRef.current) {
        clearTimeout(scratchSaveResetTimeoutRef.current);
        scratchSaveResetTimeoutRef.current = null;
      }
    };

    const resetScratchSaveState = () => {
      clearScratchSaveResetTimeout();
      setScratchSaveState("idle");
    };

    if (!enabled) {
      resetScratchSaveState();
      return undefined;
    }

    const allowedOrigin = process.env.ASSETS_URL || window.location.origin;
    const handleScratchMessage = (event) => {
      if (event.origin !== allowedOrigin) {
        return;
      }

      switch (event.data?.type) {
        case "scratch-gui-saving-started":
          clearScratchSaveResetTimeout();
          setScratchSaveState("saving");
          break;
        case "scratch-gui-saving-succeeded":
          clearScratchSaveResetTimeout();
          setScratchSaveState("saved");
          scratchSaveResetTimeoutRef.current = setTimeout(() => {
            scratchSaveResetTimeoutRef.current = null;
            setScratchSaveState("idle");
          }, SCRATCH_SAVE_RESET_DELAY_MS);
          break;
        case "scratch-gui-saving-failed":
          resetScratchSaveState();
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handleScratchMessage);

    return () => {
      window.removeEventListener("message", handleScratchMessage);
      clearScratchSaveResetTimeout();
    };
  }, [enabled]);

  const saveScratchProject = () => {
    postMessageToScratchIframe({
      type: "scratch-gui-save",
    });
  };

  return {
    scratchSaveState,
    scratchSaveLabelKey:
      SCRATCH_SAVE_LABEL_KEYS[scratchSaveState] || SCRATCH_SAVE_LABEL_KEYS.idle,
    isScratchSaving: scratchSaveState === "saving",
    saveScratchProject,
  };
};
