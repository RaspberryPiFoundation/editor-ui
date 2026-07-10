import {
  clearAutoSaveHostApi,
  clearScratchAutoSaveHostApi,
  getAutoSaveHostApi,
  registerAutoSaveHostApi,
  registerScratchAutoSaveHostApi,
} from "./autoSaveHostApi";

describe("autoSaveHostApi", () => {
  afterEach(() => {
    clearAutoSaveHostApi();
    clearScratchAutoSaveHostApi();
  });

  test("combines project and scratch navigation flush checks", () => {
    registerAutoSaveHostApi({
      shouldFlushBeforeNavigation: () => false,
    });
    registerScratchAutoSaveHostApi({
      shouldFlushBeforeNavigation: () => true,
    });

    expect(getAutoSaveHostApi().shouldFlushBeforeNavigation()).toBe(true);
  });

  test("flushes project and scratch saves in sequence", async () => {
    const projectFlush = jest.fn(() => Promise.resolve());
    const scratchFlush = jest.fn(() => Promise.resolve());

    registerAutoSaveHostApi({
      flushPendingAutoSave: projectFlush,
    });
    registerScratchAutoSaveHostApi({
      flushPendingAutoSave: scratchFlush,
    });

    await getAutoSaveHostApi().flushPendingAutoSave();

    expect(projectFlush).toHaveBeenCalledTimes(1);
    expect(scratchFlush).toHaveBeenCalledTimes(1);
    expect(projectFlush.mock.invocationCallOrder[0]).toBeLessThan(
      scratchFlush.mock.invocationCallOrder[0],
    );
  });
});
