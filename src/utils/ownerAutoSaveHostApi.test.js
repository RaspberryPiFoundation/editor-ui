import {
  clearOwnerAutoSaveHostApi,
  clearScratchAutoSaveHostApi,
  getOwnerAutoSaveHostApi,
  registerOwnerAutoSaveHostApi,
  registerScratchAutoSaveHostApi,
} from "./ownerAutoSaveHostApi";

describe("ownerAutoSaveHostApi", () => {
  afterEach(() => {
    clearOwnerAutoSaveHostApi();
    clearScratchAutoSaveHostApi();
  });

  test("combines owner and scratch navigation flush checks", () => {
    registerOwnerAutoSaveHostApi({
      shouldFlushBeforeNavigation: () => false,
    });
    registerScratchAutoSaveHostApi({
      shouldFlushBeforeNavigation: () => true,
    });

    expect(getOwnerAutoSaveHostApi().shouldFlushBeforeNavigation()).toBe(true);
  });

  test("flushes owner and scratch saves in sequence", async () => {
    const ownerFlush = jest.fn(() => Promise.resolve());
    const scratchFlush = jest.fn(() => Promise.resolve());

    registerOwnerAutoSaveHostApi({
      flushPendingAutoSave: ownerFlush,
    });
    registerScratchAutoSaveHostApi({
      flushPendingAutoSave: scratchFlush,
    });

    await getOwnerAutoSaveHostApi().flushPendingAutoSave();

    expect(ownerFlush).toHaveBeenCalledTimes(1);
    expect(scratchFlush).toHaveBeenCalledTimes(1);
    expect(ownerFlush.mock.invocationCallOrder[0]).toBeLessThan(
      scratchFlush.mock.invocationCallOrder[0],
    );
  });
});
