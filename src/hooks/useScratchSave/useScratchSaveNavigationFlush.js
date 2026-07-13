import { useEffect } from "react";
import {
  clearScratchAutoSaveHostApi,
  registerScratchAutoSaveHostApi,
} from "../../utils/save/autoSaveHostApi";

/**
 * Scratch navigation flush: pagehide / beforeunload and Scratch host API.
 *
 * Reliable on SPA navigation (host awaits flushPendingAutoSave).
 * Tab close: beforeunload warns only; pagehide is best-effort (not awaited).
 */
export const useScratchSaveNavigationFlush = ({
  enabled,
  clearAutoSaveTimeout,
  clearCooldownTimer,
  hasPendingAutoSave,
  flushPendingAutoSave,
  shouldFlushBeforeNavigation,
}) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    registerScratchAutoSaveHostApi({
      hasPendingAutoSave,
      flushPendingAutoSave,
      shouldFlushBeforeNavigation,
    });

    return () => {
      clearScratchAutoSaveHostApi();
    };
    // Omit useEffectEvent handlers from deps — they stay stable and read latest state via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePageHide = () => {
      flushPendingAutoSave();
    };

    const handleBeforeUnload = (event) => {
      if (!shouldFlushBeforeNavigation()) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearCooldownTimer();
      clearAutoSaveTimeout();
      if (shouldFlushBeforeNavigation()) {
        flushPendingAutoSave();
      }
    };
    // Omit flush/clear helpers from deps — useEffectEvent or refs; listeners only need enabled toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
};
