import React from "react";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { useScratchSaveState } from "./useScratchSaveState";
import editorReducer, { editorInitialState } from "../../redux/EditorSlice";
import {
  getScratchAllowedOrigin,
  postMessageToScratchIframe,
} from "../../utils/scratchIframe";
import {
  clearScratchAutoSaveHostApi,
  getAutoSaveHostApi,
} from "../../utils/save/autoSaveHostApi";

jest.mock("../../utils/scratchIframe", () => ({
  getScratchAllowedOrigin: jest.fn(),
  postMessageToScratchIframe: jest.fn(),
}));

jest.useFakeTimers();

const scratchOrigin = "https://scratch-frame.example.com";
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

let scratchSaveUnmount = null;

const renderScratchSaveState = (options) => {
  scratchSaveUnmount?.();

  const store = createScratchStore();
  const wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useScratchSaveState(options), { wrapper });
  scratchSaveUnmount = hook.unmount;

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

const dispatchScratchMessageEvent = (type, origin = scratchOrigin) => {
  window.dispatchEvent(
    new MessageEvent("message", {
      origin,
      data: { type },
    }),
  );
};

const dispatchScratchUserEdit = () => {
  dispatchScratchMessage("scratch-gui-project-changed");
};

describe("useScratchSaveState", () => {
  const originalScratchFrameUrl = process.env.REACT_APP_SCRATCH_FRAME_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_SCRATCH_FRAME_URL = scratchOrigin;
    getScratchAllowedOrigin.mockReturnValue(scratchOrigin);
  });

  afterEach(() => {
    scratchSaveUnmount?.();
    scratchSaveUnmount = null;
    clearScratchAutoSaveHostApi();
    jest.clearAllTimers();
    process.env.REACT_APP_SCRATCH_FRAME_URL = originalScratchFrameUrl;
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

  test("auto-saves 2 seconds after scratch-gui-ready without suppressing the first edit", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();
    dispatchScratchMessage("scratch-gui-ready");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("auto-saves 2 seconds after a Scratch project change", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();

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

  test("does not reset a scheduled auto-save after repeated Scratch project changes", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(999);
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
    dispatchScratchUserEdit();

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

    dispatchScratchUserEdit();

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
    dispatchScratchUserEdit();

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

  test("accepts messages when REACT_APP_SCRATCH_FRAME_URL contains a path", () => {
    process.env.REACT_APP_SCRATCH_FRAME_URL = `${scratchOrigin}/branches/main`;
    getScratchAllowedOrigin.mockReturnValue(scratchOrigin);

    const { store } = renderScratchSaveState({ enabled: true });

    dispatchScratchMessage("scratch-gui-saving-started");

    expect(store.getState().editor.saving).toBe("pending");
  });

  test("queues autosave during cooldown after a successful auto-save", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    dispatchScratchMessage("scratch-gui-saving-started");
    dispatchScratchMessage("scratch-gui-saving-succeeded");

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(2);
  });

  test("flushPendingAutoSave bypasses cooldown", async () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    dispatchScratchMessage("scratch-gui-saving-started");
    dispatchScratchMessage("scratch-gui-saving-succeeded");

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(1);

    await act(async () => {
      const flushPromise = getAutoSaveHostApi().flushPendingAutoSave();
      await Promise.resolve();
      await Promise.resolve();
      dispatchScratchMessageEvent("scratch-gui-saving-started");
      dispatchScratchMessageEvent("scratch-gui-saving-succeeded");
      await flushPromise;
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(2);
  });

  test("registers scratch flush state with the host API", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();

    expect(getAutoSaveHostApi().shouldFlushBeforeNavigation()).toBe(true);
  });

  test("does not register navigation flush when autoSaveEnabled is false", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: false });

    dispatchScratchUserEdit();

    expect(getAutoSaveHostApi().shouldFlushBeforeNavigation()).toBe(false);
  });

  test("beforeunload warns during the debounce window before auto-save fires", () => {
    renderScratchSaveState({ enabled: true, autoSaveEnabled: true });

    dispatchScratchUserEdit();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();
    expect(getAutoSaveHostApi().hasPendingAutoSave()).toBe(false);
    expect(getAutoSaveHostApi().shouldFlushBeforeNavigation()).toBe(true);

    const beforeUnloadEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(beforeUnloadEvent);

    expect(beforeUnloadEvent.defaultPrevented).toBe(true);
  });
});
