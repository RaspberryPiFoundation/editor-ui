export const AUTOSAVE_DEBOUNCE_MS = 2000;
export const AUTOSAVE_DEBOUNCE_LARGE_PROJECT_MS = 10000;
export const COMBINED_FILE_SIZE_SOFT_LIMIT = 1_000_000;
export const AUTOSAVE_THROTTLE_MS = 10000;

export const getAutosaveDebounceMs = (project = {}) => {
  const combinedFileSize =
    project.components?.reduce(
      (sum, component) => sum + component.content.length,
      0,
    ) ?? 0;

  return combinedFileSize > COMBINED_FILE_SIZE_SOFT_LIMIT
    ? AUTOSAVE_DEBOUNCE_LARGE_PROJECT_MS
    : AUTOSAVE_DEBOUNCE_MS;
};

export const getRemainingThrottleMs = (
  lastCompletedAt,
  throttleMs = AUTOSAVE_THROTTLE_MS,
  now = Date.now(),
) => {
  if (lastCompletedAt == null) {
    return 0;
  }

  return Math.max(0, lastCompletedAt + throttleMs - now);
};

export const isInAutosaveThrottle = (
  lastCompletedAt,
  throttleMs = AUTOSAVE_THROTTLE_MS,
  now = Date.now(),
) => getRemainingThrottleMs(lastCompletedAt, throttleMs, now) > 0;

export const hasOutstandingAutosaveWork = ({
  queued,
  inFlight,
  lastCompletedAt,
  throttleMs = AUTOSAVE_THROTTLE_MS,
  now = Date.now(),
}) =>
  queued || inFlight || isInAutosaveThrottle(lastCompletedAt, throttleMs, now);

export const getRemainingDebounceMs = (
  lastChangedAt,
  debounceMs,
  now = Date.now(),
) => {
  if (lastChangedAt == null) {
    return 0;
  }

  return Math.max(0, lastChangedAt + debounceMs - now);
};

export const clearTimerRef = (timerRef) => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};
