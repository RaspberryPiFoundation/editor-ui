import {
  cancelPendingRunEventDebounce,
  endRunEventCycle,
  handleRunEndedForEventCycle,
  resetRunEventCodeSnapshot,
  RUN_EVENT_DEBOUNCE_MS,
  scheduleRunEventCycle,
  shouldEmitRunCompletedEvent,
} from "./runEventCodeSnapshot";

const components = [
  { name: "main", extension: "py", content: "print('hello')" },
];

const flushDebounce = () => {
  jest.advanceTimersByTime(RUN_EVENT_DEBOUNCE_MS);
};

describe("runEventCodeSnapshot", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetRunEventCodeSnapshot();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("allows the first run for a project after debounce", () => {
    const onRunStarted = jest.fn();

    scheduleRunEventCycle("project-a", components, {}, { onRunStarted });
    flushDebounce();

    expect(onRunStarted).toHaveBeenCalledTimes(1);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("suppresses repeated runs with unchanged code", () => {
    const onRunStarted = jest.fn();

    scheduleRunEventCycle("project-a", components, {}, { onRunStarted });
    flushDebounce();
    endRunEventCycle();

    scheduleRunEventCycle("project-a", components, {}, { onRunStarted });
    flushDebounce();

    expect(onRunStarted).toHaveBeenCalledTimes(1);
    expect(shouldEmitRunCompletedEvent()).toBe(false);
  });

  test("allows a run after code changes", () => {
    const onRunStarted = jest.fn();

    scheduleRunEventCycle("project-a", components, {}, { onRunStarted });
    flushDebounce();
    endRunEventCycle();

    const updatedComponents = [
      { name: "main", extension: "py", content: "print('world')" },
    ];

    scheduleRunEventCycle("project-a", updatedComponents, {}, { onRunStarted });
    flushDebounce();

    expect(onRunStarted).toHaveBeenCalledTimes(2);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("collapses a rapid burst into one run event", () => {
    const onRunStarted = jest.fn();
    const onRunCompletedIfRunAlreadyEnded = jest.fn();

    scheduleRunEventCycle(
      "project-a",
      components,
      { bypassSnapshot: true },
      { onRunStarted, onRunCompletedIfRunAlreadyEnded },
    );
    scheduleRunEventCycle(
      "project-a",
      components,
      { bypassSnapshot: true },
      { onRunStarted, onRunCompletedIfRunAlreadyEnded },
    );
    handleRunEndedForEventCycle({
      onRunCompleted: onRunCompletedIfRunAlreadyEnded,
    });
    flushDebounce();

    expect(onRunStarted).toHaveBeenCalledTimes(1);
    expect(onRunCompletedIfRunAlreadyEnded).toHaveBeenCalledTimes(1);
    expect(shouldEmitRunCompletedEvent()).toBe(false);
  });

  test("emits run completed on run end after debounced start", () => {
    const onRunStarted = jest.fn();
    const onRunCompleted = jest.fn();

    scheduleRunEventCycle("project-a", components, {}, { onRunStarted });
    flushDebounce();

    handleRunEndedForEventCycle({ onRunCompleted: onRunCompleted });

    expect(onRunStarted).toHaveBeenCalledTimes(1);
    expect(onRunCompleted).toHaveBeenCalledTimes(1);
  });

  test("resets snapshot when the project identifier changes", () => {
    const onRunStarted = jest.fn();

    scheduleRunEventCycle("project-a", components, {}, { onRunStarted });
    flushDebounce();
    endRunEventCycle();

    scheduleRunEventCycle("project-b", components, {}, { onRunStarted });
    flushDebounce();

    expect(onRunStarted).toHaveBeenCalledTimes(2);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("allows separate bursts after debounce quiet period", () => {
    const onRunStarted = jest.fn();

    scheduleRunEventCycle(
      "project-a",
      components,
      { bypassSnapshot: true },
      { onRunStarted },
    );
    flushDebounce();
    endRunEventCycle();

    jest.advanceTimersByTime(RUN_EVENT_DEBOUNCE_MS);

    scheduleRunEventCycle(
      "project-a",
      components,
      { bypassSnapshot: true },
      { onRunStarted },
    );
    flushDebounce();

    expect(onRunStarted).toHaveBeenCalledTimes(2);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("does not fire pending callbacks after debounce is cancelled", () => {
    const onRunStarted = jest.fn();

    scheduleRunEventCycle(
      "project-a",
      components,
      { bypassSnapshot: true },
      { onRunStarted },
    );
    cancelPendingRunEventDebounce();
    flushDebounce();

    expect(onRunStarted).not.toHaveBeenCalled();
    expect(shouldEmitRunCompletedEvent()).toBe(false);
  });
});
