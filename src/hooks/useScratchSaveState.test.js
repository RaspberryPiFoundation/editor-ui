import React from "react";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { useScratchSaveState } from "./useScratchSaveState";
import editorReducer, { editorInitialState } from "../redux/EditorSlice";
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
const scratchProject = {
  identifier: "scratch-project",
  project_type: "code_editor_scratch",
  components: [],
};

const createScratchStore = () =>
  configureStore({
    reducer: {
      editor: editorReducer,
    },
    preloadedState: {
      editor: {
        ...editorInitialState,
        loading: "success",
        project: scratchProject,
      },
    },
  });

const renderScratchSaveState = (options) => {
  const store = createScratchStore();
  const wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useScratchSaveState(options), { wrapper });

  return { ...hook, store };
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
    const { result } = renderScratchSaveState();

    act(() => {
      result.current.saveScratchProject();
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("posts the scratch remix command on the first save", () => {
    const { result } = renderScratchSaveState();

    act(() => {
      result.current.saveScratchProject({ shouldRemixOnSave: true });
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-remix",
    });
  });

  test("does not auto-save project changes until auto-save is enabled", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: false });

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();
  });

  test("auto-saves 2 seconds after a Scratch project change", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(1999);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("debounces repeated Scratch project changes", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(1999);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(1);
    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("queues auto-save when a Scratch project change happens during an in-flight save", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchMessage("scratch-gui-saving-started");
    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    dispatchScratchMessage("scratch-gui-saving-succeeded");

    act(() => {
      jest.advanceTimersByTime(999);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("tracks auto-saving messages in editor save state", () => {
    const { store } = renderScratchSaveState({
      enabled: true,
      autoSaveEnabled: true,
    });

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    dispatchScratchMessage("scratch-gui-saving-started");
    expect(store.getState().editor.saving).toBe("pending");

    dispatchScratchMessage("scratch-gui-saving-succeeded");

    expect(store.getState().editor.saving).toBe("success");
    expect(store.getState().editor.lastSaveAutosave).toBe(true);
    expect(store.getState().editor.lastSavedTime).toEqual(expect.any(Number));
  });

  test("tracks manual saving messages in editor save state", () => {
    const { result, store } = renderScratchSaveState({ enabled: true });

    act(() => {
      result.current.saveScratchProject();
    });

    dispatchScratchMessage("scratch-gui-saving-started");
    expect(store.getState().editor.saving).toBe("pending");

    dispatchScratchMessage("scratch-gui-saving-succeeded");

    expect(store.getState().editor.saving).toBe("success");
    expect(store.getState().editor.lastSaveAutosave).toBe(false);
    expect(store.getState().editor.lastSavedTime).toEqual(expect.any(Number));
  });

  test("tracks remixing messages in editor save state", () => {
    const { store } = renderScratchSaveState({ enabled: true });

    dispatchScratchMessage("scratch-gui-remixing-started");
    expect(store.getState().editor.saving).toBe("pending");

    dispatchScratchMessage("scratch-gui-remixing-succeeded");

    expect(store.getState().editor.saving).toBe("success");
    expect(store.getState().editor.lastSaveAutosave).toBe(false);
    expect(store.getState().editor.lastSavedTime).toEqual(expect.any(Number));
  });

  test("sets failed save state after a remix failure", () => {
    const { store } = renderScratchSaveState({ enabled: true });

    dispatchScratchMessage("scratch-gui-remixing-started");
    dispatchScratchMessage("scratch-gui-remixing-failed");

    expect(store.getState().editor.saving).toBe("failed");
  });

  test("retries a queued auto-save after an in-flight save fails", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchMessage("scratch-gui-saving-started");
    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    dispatchScratchMessage("scratch-gui-saving-failed");

    act(() => {
      jest.advanceTimersByTime(999);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("ignores messages from the wrong origin", () => {
    const { store } = renderScratchSaveState({ enabled: true });

    dispatchScratchMessage(
      "scratch-gui-saving-started",
      "https://other.example.com",
    );

    expect(store.getState().editor.saving).toBe("idle");
  });

  test("accepts messages when ASSETS_URL contains a path", () => {
    process.env.ASSETS_URL = `${scratchOrigin}/branches/main`;
    getScratchAllowedOrigin.mockReturnValue(scratchOrigin);

    const { store } = renderScratchSaveState({ enabled: true });

    dispatchScratchMessage("scratch-gui-saving-started");

    expect(store.getState().editor.saving).toBe("pending");
  });
});
