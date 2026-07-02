import {
  getPrevCodeRunTriggered,
  resetCodeRunEventTracking,
  setPrevCodeRunTriggered,
  syncRunEventTrackingProject,
} from "./runEventTrackingState";

describe("runEventTrackingState", () => {
  beforeEach(() => {
    resetCodeRunEventTracking();
  });

  test("tracks the previous codeRunTriggered value across calls", () => {
    expect(getPrevCodeRunTriggered()).toBe(false);
    setPrevCodeRunTriggered(true);
    expect(getPrevCodeRunTriggered()).toBe(true);
  });

  test("resets tracking state", () => {
    setPrevCodeRunTriggered(true);
    syncRunEventTrackingProject("project-a", true);

    resetCodeRunEventTracking();

    expect(getPrevCodeRunTriggered()).toBe(false);
  });

  test("resets prev state when the project identifier changes", () => {
    syncRunEventTrackingProject("project-a", true);
    setPrevCodeRunTriggered(true);

    syncRunEventTrackingProject("project-b", false);

    expect(getPrevCodeRunTriggered()).toBe(false);
  });
});
