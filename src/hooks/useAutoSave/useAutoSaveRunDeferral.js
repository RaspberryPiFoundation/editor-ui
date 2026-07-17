import { useEffect, useRef } from "react";

/**
 * Python run deferral: while code runs, lifecycle queues saves;
 * when codeRunInProgress goes false, drain the queue.
 */
export const useAutoSaveRunDeferral = ({
  enabled,
  codeRunInProgress,
  flushQueuedSave,
}) => {
  const prevCodeRunInProgressRef = useRef(codeRunInProgress);

  useEffect(() => {
    const wasInProgress = prevCodeRunInProgressRef.current;
    prevCodeRunInProgressRef.current = codeRunInProgress;

    if (wasInProgress && !codeRunInProgress && enabled) {
      flushQueuedSave();
    }
    // Omit flushQueuedSave from deps — useEffectEvent; must not re-run on callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRunInProgress, enabled]);
};
