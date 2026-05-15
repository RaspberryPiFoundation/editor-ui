import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getScratchAllowedOrigin,
  postMessageToScratchIframe,
} from "../utils/scratchIframe";
import {
  scratchSaveFailed,
  scratchSaveStarted,
  scratchSaveSucceeded,
} from "../redux/EditorSlice";

const SCRATCH_AUTOSAVE_DELAY_MS = 2000;

export const useScratchSaveState = ({
  enabled = false,
  autoSaveEnabled = false,
} = {}) => {
  const dispatch = useDispatch();
  const autoSaveTimeoutRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const autoSaveEnabledRef = useRef(false);
  const autoSaveQueuedAfterSaveRef = useRef(false);
  const projectChangedAtRef = useRef(null);

  const clearAutoSaveTimeout = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  }, []);

  const postSaveRequest = useCallback(() => {
    postMessageToScratchIframe({
      type: "scratch-gui-save",
    });
  }, []);

  const scheduleAutoSave = useCallback(
    (delay = SCRATCH_AUTOSAVE_DELAY_MS) => {
      clearAutoSaveTimeout();

      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveTimeoutRef.current = null;

        if (!autoSaveEnabledRef.current) {
          return;
        }

        if (saveInFlightRef.current) {
          autoSaveQueuedAfterSaveRef.current = true;
          return;
        }

        autoSaveQueuedAfterSaveRef.current = false;
        postSaveRequest();
      }, delay);
    },
    [clearAutoSaveTimeout, postSaveRequest],
  );

  const scheduleQueuedAutoSave = useCallback(() => {
    if (!autoSaveQueuedAfterSaveRef.current) {
      return;
    }

    autoSaveQueuedAfterSaveRef.current = false;

    if (!autoSaveEnabledRef.current) {
      return;
    }

    const lastChangedAt = projectChangedAtRef.current;
    const remainingDebounceTime =
      lastChangedAt == null
        ? 0
        : Math.max(0, lastChangedAt + SCRATCH_AUTOSAVE_DELAY_MS - Date.now());

    scheduleAutoSave(remainingDebounceTime);
  }, [scheduleAutoSave]);

  useEffect(() => {
    autoSaveEnabledRef.current = Boolean(enabled && autoSaveEnabled);

    if (!autoSaveEnabledRef.current) {
      clearAutoSaveTimeout();
      autoSaveQueuedAfterSaveRef.current = false;
    }
  }, [autoSaveEnabled, clearAutoSaveTimeout, enabled]);

  useEffect(() => {
    const resetScratchSaveTracking = () => {
      saveInFlightRef.current = false;
    };

    if (!enabled) {
      resetScratchSaveTracking();
      clearAutoSaveTimeout();
      return undefined;
    }

    const allowedOrigin = getScratchAllowedOrigin();
    const handleScratchMessage = (event) => {
      if (event.origin !== allowedOrigin) {
        return;
      }

      switch (event.data?.type) {
        case "scratch-gui-project-changed":
          if (!autoSaveEnabledRef.current) {
            break;
          }
          projectChangedAtRef.current = Date.now();
          if (saveInFlightRef.current) {
            autoSaveQueuedAfterSaveRef.current = true;
            break;
          }
          scheduleAutoSave();
          break;
        case "scratch-gui-saving-started":
        case "scratch-gui-remixing-started":
          saveInFlightRef.current = true;
          dispatch(scratchSaveStarted());
          break;
        case "scratch-gui-saving-succeeded":
          saveInFlightRef.current = false;
          dispatch(scratchSaveSucceeded({ autosave: true }));
          scheduleQueuedAutoSave();
          break;
        case "scratch-gui-remixing-succeeded":
          saveInFlightRef.current = false;
          dispatch(scratchSaveSucceeded({ autosave: false }));
          scheduleQueuedAutoSave();
          break;
        case "scratch-gui-saving-failed":
        case "scratch-gui-remixing-failed":
          autoSaveQueuedAfterSaveRef.current = false;
          clearAutoSaveTimeout();
          resetScratchSaveTracking();
          dispatch(scratchSaveFailed());
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handleScratchMessage);

    return () => {
      window.removeEventListener("message", handleScratchMessage);
      clearAutoSaveTimeout();
    };
  }, [
    clearAutoSaveTimeout,
    dispatch,
    enabled,
    scheduleAutoSave,
    scheduleQueuedAutoSave,
  ]);

  const saveScratchProject = useCallback(
    ({ shouldRemixOnSave = false } = {}) => {
      clearAutoSaveTimeout();
      autoSaveQueuedAfterSaveRef.current = false;
      postMessageToScratchIframe({
        type: shouldRemixOnSave ? "scratch-gui-remix" : "scratch-gui-save",
      });
    },
    [clearAutoSaveTimeout],
  );

  return {
    saveScratchProject,
  };
};
