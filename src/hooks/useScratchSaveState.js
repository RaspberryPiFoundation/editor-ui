import { useEffect, useRef, useState } from "react";
import { postMessageToScratchIframe } from "../utils/scratchIframe";

const SCRATCH_SAVE_LABEL_KEYS = {
  idle: "header.save",
  saving: "saveStatus.saving",
  saved: "saveStatus.saved",
};
const SCRATCH_SAVE_MINIMUM_SAVING_DURATION_MS = 1000;
const SCRATCH_SAVE_RESET_DELAY_MS = 5000;

export const useScratchSaveState = ({ enabled = false } = {}) => {
  const scratchSaveTimeoutRef = useRef(null);
  const scratchSavingStartedAtRef = useRef(null);
  const [scratchSaveState, setScratchSaveState] = useState("idle");

  useEffect(() => {
    const clearScratchSaveTimeout = () => {
      if (scratchSaveTimeoutRef.current) {
        clearTimeout(scratchSaveTimeoutRef.current);
        scratchSaveTimeoutRef.current = null;
      }
    };

    const resetScratchSaveState = () => {
      clearScratchSaveTimeout();
      scratchSavingStartedAtRef.current = null;
      setScratchSaveState("idle");
    };

    const transitionScratchSaveStateToSaved = () => {
      scratchSaveTimeoutRef.current = null;
      scratchSavingStartedAtRef.current = null;
      setScratchSaveState("saved");
      scratchSaveTimeoutRef.current = setTimeout(() => {
        scratchSaveTimeoutRef.current = null;
        setScratchSaveState("idle");
      }, SCRATCH_SAVE_RESET_DELAY_MS);
    };

    const scheduleScratchSaveStateToSaved = () => {
      clearScratchSaveTimeout();

      const savingStartedAt = scratchSavingStartedAtRef.current;
      if (savingStartedAt == null) {
        transitionScratchSaveStateToSaved();
        return;
      }

      const savingCanFinishAt =
        savingStartedAt + SCRATCH_SAVE_MINIMUM_SAVING_DURATION_MS;
      const remainingSavingTime = savingCanFinishAt - Date.now();

      if (remainingSavingTime <= 0) {
        transitionScratchSaveStateToSaved();
        return;
      }

      scratchSaveTimeoutRef.current = setTimeout(
        transitionScratchSaveStateToSaved,
        remainingSavingTime,
      );
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
        case "scratch-gui-remixing-started":
          clearScratchSaveTimeout();
          scratchSavingStartedAtRef.current = Date.now();
          setScratchSaveState("saving");
          break;
        case "scratch-gui-saving-succeeded":
        case "scratch-gui-remixing-succeeded":
          scheduleScratchSaveStateToSaved();
          break;
        case "scratch-gui-saving-failed":
        case "scratch-gui-remixing-failed":
          resetScratchSaveState();
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handleScratchMessage);

    return () => {
      window.removeEventListener("message", handleScratchMessage);
      clearScratchSaveTimeout();
    };
  }, [enabled]);

  const saveScratchProject = ({ shouldRemixOnSave = false } = {}) => {
    postMessageToScratchIframe({
      type: shouldRemixOnSave ? "scratch-gui-remix" : "scratch-gui-save",
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
