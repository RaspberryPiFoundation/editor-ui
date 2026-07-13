import { useEffect } from "react";
import {
  clearAutoSaveHostApi,
  registerAutoSaveHostApi,
} from "../../utils/autoSaveHostApi";

/**
 * Navigation flush: pagehide / beforeunload and host API.
 *
 * flushPendingAutoSave (in lifecycle) bypasses cooldown and waits for in-flight work.
 */
export const useAutoSaveNavigationFlush = ({
  enabled,
  lifecycle,
  hasPendingAutoSave,
  flushPendingAutoSave,
  shouldFlushBeforeNavigation,
}) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    registerAutoSaveHostApi({
      hasPendingAutoSave,
      flushPendingAutoSave,
      shouldFlushBeforeNavigation,
    });

    return () => {
      clearAutoSaveHostApi();
    };
    // Omit useEffectEvent handlers from deps — they stay stable and call lifecycle via refs.
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
      lifecycle.clearCooldownTimer();
      flushPendingAutoSave();
    };
    // Omit useEffectEvent handlers from deps — they stay stable and call lifecycle via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, lifecycle]);
};
