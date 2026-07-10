import {
  AUTOSAVE_COOLDOWN_MS,
  AUTOSAVE_DEBOUNCE_LARGE_PROJECT_MS,
  AUTOSAVE_DEBOUNCE_MS,
  clearTimerRef,
  getAutosaveDebounceMs,
  getRemainingCooldownMs,
  getRemainingDebounceMs,
  hasOutstandingAutosaveWork,
  isInAutosaveCooldown,
} from "./autoSaveScheduling";

describe("autoSaveScheduling", () => {
  test("getRemainingCooldownMs returns 0 when no prior save", () => {
    expect(getRemainingCooldownMs(null)).toBe(0);
  });

  test("getRemainingCooldownMs returns remaining time during cooldown", () => {
    const now = 1_000_000;
    const lastCompletedAt = now - 2_000;

    expect(
      getRemainingCooldownMs(lastCompletedAt, AUTOSAVE_COOLDOWN_MS, now),
    ).toBe(8_000);
  });

  test("isInAutosaveCooldown is false after cooldown expires", () => {
    const now = 1_000_000;
    const lastCompletedAt = now - AUTOSAVE_COOLDOWN_MS;

    expect(
      isInAutosaveCooldown(lastCompletedAt, AUTOSAVE_COOLDOWN_MS, now),
    ).toBe(false);
  });

  test("hasOutstandingAutosaveWork reflects queue, in-flight, and cooldown", () => {
    const now = 1_000_000;

    expect(
      hasOutstandingAutosaveWork({
        queued: false,
        inFlight: false,
        lastCompletedAt: null,
        now,
      }),
    ).toBe(false);

    expect(
      hasOutstandingAutosaveWork({
        queued: true,
        inFlight: false,
        lastCompletedAt: null,
        now,
      }),
    ).toBe(true);

    expect(
      hasOutstandingAutosaveWork({
        queued: false,
        inFlight: true,
        lastCompletedAt: null,
        now,
      }),
    ).toBe(true);

    expect(
      hasOutstandingAutosaveWork({
        queued: false,
        inFlight: false,
        lastCompletedAt: now - 1_000,
        now,
      }),
    ).toBe(true);
  });

  test("getRemainingDebounceMs returns remaining debounce window", () => {
    const now = 5_000;

    expect(getRemainingDebounceMs(now - 500, 2_000, now)).toBe(1_500);
    expect(getRemainingDebounceMs(null, 2_000, now)).toBe(0);
  });

  test("getAutosaveDebounceMs uses standard debounce for small projects", () => {
    expect(
      getAutosaveDebounceMs({
        components: [{ content: "print('hi')" }],
      }),
    ).toBe(AUTOSAVE_DEBOUNCE_MS);
  });

  test("getAutosaveDebounceMs uses longer debounce for large projects", () => {
    expect(
      getAutosaveDebounceMs({
        components: [{ content: "x".repeat(1_000_001) }],
      }),
    ).toBe(AUTOSAVE_DEBOUNCE_LARGE_PROJECT_MS);
  });

  test("clearTimerRef clears an active timeout ref", () => {
    const timerRef = { current: setTimeout(() => {}, 1_000) };

    clearTimerRef(timerRef);

    expect(timerRef.current).toBeNull();
  });
});
