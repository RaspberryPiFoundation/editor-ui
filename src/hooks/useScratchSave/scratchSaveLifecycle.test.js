import { createScratchSaveLifecycle } from "./scratchSaveLifecycle";

jest.useFakeTimers();

const createLifecycle = ({
  context = {},
  scheduler = { queued: false, inFlight: false, lastCompletedAt: null },
} = {}) => {
  const schedulerState = { ...scheduler };
  const inFlightSavePromiseRef = { current: null };
  const inFlightSaveResolveRef = { current: null };
  const inFlightSaveRejectRef = { current: null };
  const currentSaveIsAutosaveRef = { current: false };
  const throttleTimerRef = { current: null };
  const autoSaveTimeoutRef = { current: null };

  let dirty = context.dirty ?? true;
  let projectChangedAt = context.projectChangedAt ?? Date.now();
  const postSave = jest.fn();

  const baseContext = {
    canAutoSave: () => context.canAutoSave ?? true,
    hasProjectChanged: () => dirty,
    getProjectChangedAt: () => projectChangedAt,
    clearDirty: () => {
      dirty = false;
    },
    markProjectChanged: () => {
      dirty = true;
      projectChangedAt = Date.now();
    },
    ...context,
  };

  const lifecycle = createScratchSaveLifecycle({
    getContext: () => baseContext,
    getScheduler: () => schedulerState,
    postSave,
    inFlightSavePromiseRef,
    inFlightSaveResolveRef,
    inFlightSaveRejectRef,
    currentSaveIsAutosaveRef,
    throttleTimerRef,
    autoSaveTimeoutRef,
  });

  return {
    lifecycle,
    schedulerState,
    postSave,
    baseContext,
    triggerProjectChanged: () => {
      dirty = true;
      projectChangedAt = Date.now();
      lifecycle.onProjectChanged();
    },
    resolveInFlight: () => inFlightSaveResolveRef.current?.(),
    rejectInFlight: () =>
      inFlightSaveRejectRef.current?.(new Error("save failed")),
  };
};

describe("scratchSaveLifecycle", () => {
  test("onProjectChanged debounces before posting a save", () => {
    const { postSave, triggerProjectChanged } = createLifecycle();

    triggerProjectChanged();

    expect(postSave).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);

    expect(postSave).toHaveBeenCalledWith({ autosave: true });
  });

  test("queues saves during in-flight work", () => {
    const { lifecycle, postSave, triggerProjectChanged, resolveInFlight } =
      createLifecycle();

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(1);

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(1);

    resolveInFlight();
    lifecycle.markSaveSucceeded(false);
    jest.advanceTimersByTime(2000);

    expect(postSave).toHaveBeenCalledTimes(2);
  });

  test("flushPendingAutoSave bypasses throttle", async () => {
    const { lifecycle, postSave, triggerProjectChanged, resolveInFlight } =
      createLifecycle();

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    resolveInFlight();
    lifecycle.markSaveSucceeded(true);

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(1);

    const flushPromise = lifecycle.flushPendingAutoSave();
    await Promise.resolve();
    resolveInFlight();
    lifecycle.markSaveSucceeded(true);
    await flushPromise;

    expect(postSave).toHaveBeenCalledTimes(2);
  });

  test("shouldFlushBeforeNavigation is true when dirty during debounce, hasPendingAutoSave is false", () => {
    const { lifecycle, triggerProjectChanged } = createLifecycle();

    triggerProjectChanged();

    expect(lifecycle.shouldFlushBeforeNavigation()).toBe(true);
    expect(lifecycle.hasPendingAutoSave()).toBe(false);
  });

  test("hasPendingAutoSave is false when autosave is disabled", () => {
    const { lifecycle, triggerProjectChanged } = createLifecycle({
      context: {
        canAutoSave: () => false,
      },
    });

    triggerProjectChanged();

    expect(lifecycle.shouldFlushBeforeNavigation()).toBe(false);
    expect(lifecycle.hasPendingAutoSave()).toBe(false);
  });

  test("autosave retries at most once after failure", () => {
    const { lifecycle, postSave, schedulerState, triggerProjectChanged } =
      createLifecycle();

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(1);

    lifecycle.markAutosaveFailed(true);
    lifecycle.flushQueuedSave();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(2);
    expect(schedulerState.autosaveRetryUsed).toBe(true);

    lifecycle.markAutosaveFailed(true);
    lifecycle.flushQueuedSave();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(2);
    expect(schedulerState.queued).toBe(false);
  });

  test("onProjectChanged after exhausted retries attempts save again", () => {
    const { postSave, triggerProjectChanged, lifecycle } = createLifecycle();

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    lifecycle.markAutosaveFailed(true);
    lifecycle.flushQueuedSave();
    jest.advanceTimersByTime(2000);
    lifecycle.markAutosaveFailed(true);
    lifecycle.flushQueuedSave();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(2);

    triggerProjectChanged();
    jest.advanceTimersByTime(2000);
    expect(postSave).toHaveBeenCalledTimes(3);
  });
});
