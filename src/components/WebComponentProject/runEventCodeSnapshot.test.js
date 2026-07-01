import {
  beginRunEventCycle,
  endRunEventCycle,
  resetRunEventCodeSnapshot,
  shouldEmitRunCompletedEvent,
} from "./runEventCodeSnapshot";

const components = [
  { name: "main", extension: "py", content: "print('hello')" },
];

describe("runEventCodeSnapshot", () => {
  beforeEach(() => {
    resetRunEventCodeSnapshot();
  });

  test("allows the first run for a project", () => {
    expect(beginRunEventCycle("project-a", components)).toBe(true);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("suppresses repeated runs with unchanged code", () => {
    beginRunEventCycle("project-a", components);
    endRunEventCycle();

    expect(beginRunEventCycle("project-a", components)).toBe(false);
    expect(shouldEmitRunCompletedEvent()).toBe(false);
  });

  test("allows a run after code changes", () => {
    beginRunEventCycle("project-a", components);
    endRunEventCycle();

    const updatedComponents = [
      { name: "main", extension: "py", content: "print('world')" },
    ];

    expect(beginRunEventCycle("project-a", updatedComponents)).toBe(true);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("resets snapshot when the project identifier changes", () => {
    beginRunEventCycle("project-a", components);
    endRunEventCycle();

    expect(beginRunEventCycle("project-b", components)).toBe(true);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });

  test("allows repeated runs when snapshot bypass is enabled", () => {
    beginRunEventCycle("project-a", components);
    endRunEventCycle();

    expect(
      beginRunEventCycle("project-a", components, { bypassSnapshot: true }),
    ).toBe(true);
    expect(shouldEmitRunCompletedEvent()).toBe(true);
  });
});
