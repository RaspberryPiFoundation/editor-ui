import { useEffect, useRef } from "react";
import { expireJustLoaded } from "../../redux/EditorSlice";
import {
  clearTimerRef,
  getAutosaveDebounceMs,
} from "../../utils/autoSaveScheduling";

/**
 * Debounce edits before calling requestAutoSave.
 *
 * 2s normally; 10s when combined file content exceeds 1MB.
 * justLoaded is read from contextRef when the timer fires, not from effect deps.
 */
export const useAutoSaveDebounce = ({
  enabled,
  dispatch,
  contextRef,
  requestAutoSave,
}) => {
  const debounceTimerRef = useRef(null);
  const { project, user } = contextRef.current;
  const editDebounceMs = getAutosaveDebounceMs(project);

  useEffect(() => {
    clearTimerRef(debounceTimerRef);

    if (!enabled) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;

      if (contextRef.current.justLoaded) {
        dispatch(expireJustLoaded());
      }

      requestAutoSave();
    }, editDebounceMs);

    return () => clearTimerRef(debounceTimerRef);
    // Omit requestAutoSave (useEffectEvent) and justLoaded (read from contextRef when timer fires).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editDebounceMs, enabled, project, user]);
};
