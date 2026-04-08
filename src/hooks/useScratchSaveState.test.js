import { act, renderHook } from "@testing-library/react";

import { useScratchSaveState } from "./useScratchSaveState";
import {
  getScratchAllowedOrigin,
  postMessageToScratchIframe,
} from "../utils/scratchIframe";

jest.mock("../utils/scratchIframe", () => ({
  getScratchAllowedOrigin: jest.fn(),
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
    getScratchAllowedOrigin.mockReturnValue(scratchOrigin);
  });

  afterEach(() => {
    jest.clearAllTimers();
    process.env.ASSETS_URL = originalAssetsUrl;
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

  test("posts the scratch remix command on the first save", () => {
    const { result } = renderHook(() => useScratchSaveState());

    act(() => {
      result.current.saveScratchProject({ shouldRemixOnSave: true });
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-remix",
    });
  });

  test("keeps saving visible for at least 1 second before resetting 5 seconds after saved", () => {
    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage("scratch-gui-saving-started");
    assertScratchSaveState(result, "saving", "saveStatus.saving", true);

    dispatchScratchMessage("scratch-gui-saving-succeeded");

    act(() => {
      jest.advanceTimersByTime(999);
    });

    assertScratchSaveState(result, "saving", "saveStatus.saving", true);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    assertScratchSaveState(result, "saved", "saveStatus.saved", false);

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    assertScratchSaveState(result, "saved", "saveStatus.saved", false);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    assertScratchSaveState(result, "idle", "header.save", false);
  });

  test("tracks remixing messages with the same save state lifecycle", () => {
    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage("scratch-gui-remixing-started");
    assertScratchSaveState(result, "saving", "saveStatus.saving", true);

    dispatchScratchMessage("scratch-gui-remixing-succeeded");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    assertScratchSaveState(result, "saved", "saveStatus.saved", false);
  });

  test("resets to idle after a remix failure", () => {
    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage("scratch-gui-remixing-started");
    dispatchScratchMessage("scratch-gui-remixing-failed");

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

  test("accepts messages when ASSETS_URL contains a path", () => {
    process.env.ASSETS_URL = `${scratchOrigin}/branches/main`;
    getScratchAllowedOrigin.mockReturnValue(scratchOrigin);

    const { result } = renderHook(() => useScratchSaveState({ enabled: true }));

    dispatchScratchMessage("scratch-gui-saving-started");

    assertScratchSaveState(result, "saving", "saveStatus.saving", true);
  });
});
