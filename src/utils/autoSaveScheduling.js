export const AUTOSAVE_COOLDOWN_MS = 10000;

export const getRemainingCooldownMs = (
  lastCompletedAt,
  cooldownMs = AUTOSAVE_COOLDOWN_MS,
  now = Date.now(),
) => {
  if (lastCompletedAt == null) {
    return 0;
  }

  return Math.max(0, lastCompletedAt + cooldownMs - now);
};

export const isInAutosaveCooldown = (
  lastCompletedAt,
  cooldownMs = AUTOSAVE_COOLDOWN_MS,
  now = Date.now(),
) => getRemainingCooldownMs(lastCompletedAt, cooldownMs, now) > 0;

export const hasOutstandingAutosaveWork = ({
  queued,
  inFlight,
  lastCompletedAt,
  cooldownMs = AUTOSAVE_COOLDOWN_MS,
  now = Date.now(),
}) =>
  queued || inFlight || isInAutosaveCooldown(lastCompletedAt, cooldownMs, now);

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
