import { act, renderHook } from "@testing-library/react";

import { useScratchSaveState } from "./useScratchSaveState";
import { postMessageToScratchIframe } from "../utils/scratchIframe";

jest.mock("../utils/scratchIframe", () => ({
  postMessageToScratchIframe: jest.fn(),
}));

jest.useFakeTimers();

const scratchOrigin = "https://assets.example.com";

const assertScratchSaveState = (result, state, labelKey, isSaving) => {
  expect(result.current.scratchSaveState).toBe(state);
  expect(result.current.scratchSaveLabelKey).toBe(labelKey);
  expect(result.current.isScratchSaving).toBe(isSaving);
};

const dispatchScratchMessage = (type, origin = scratchOrigin) => {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin,
        data: { type },
      }),
    );
  });
};

describe("useScratchSaveState", () => {
  const originalAssetsUrl = process.env.ASSETS_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ASSETS_URL = scratchOrigin;
  });

  afterEach(() => {
    process.env.ASSETS_URL = originalAssetsUrl;
  });

  test("returns idle save state by default", () => {
    const { result } = renderHook(() => useScratchSaveState());

    assertScratchSaveState(result, "idle", "header.save", false);
  });

  test("posts the scratch save command", () => {
    const { result } = renderHook(() => useScratchSaveState());

    act(() => {
      result.current.saveScratchProject();
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("updates from saving to saved and resets after 5 seconds", () => {
    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage("scratch-gui-saving-started");
    assertScratchSaveState(result, "saving", "saveStatus.saving", true);

    dispatchScratchMessage("scratch-gui-saving-succeeded");
    assertScratchSaveState(result, "saved", "saveStatus.saved", false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    assertScratchSaveState(result, "idle", "header.save", false);
  });

  test("resets to idle after a save failure", () => {
    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage("scratch-gui-saving-started");
    dispatchScratchMessage("scratch-gui-saving-failed");

    assertScratchSaveState(result, "idle", "header.save", false);
  });

  test("ignores messages from the wrong origin", () => {
    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage(
      "scratch-gui-saving-started",
      "https://other.example.com",
    );

    assertScratchSaveState(result, "idle", "header.save", false);
  });

  test("resets and stops handling messages when disabled", () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useScratchSaveState({ enabled }),
      {
        initialProps: { enabled: true },
      },
    );

    dispatchScratchMessage("scratch-gui-saving-started");
    expect(result.current.scratchSaveState).toBe("saving");

    rerender({ enabled: false });

    assertScratchSaveState(result, "idle", "header.save", false);

    dispatchScratchMessage("scratch-gui-saving-started");
    assertScratchSaveState(result, "idle", "header.save", false);
  });
});
