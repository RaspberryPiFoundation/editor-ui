import React from "react";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import WebComponentProject from "./WebComponentProject";
import EditorReducer from "../../redux/EditorSlice";
import WebComponentAuthSlice from "../../redux/WebComponentAuthSlice";
import InstructionsSlice from "../../redux/InstructionsSlice";
import {
  applyScratchProjectIdentifierUpdate,
  setProject,
  updateProjectComponent,
} from "../../redux/EditorSlice";
import { projectIdentifierChangedEvent } from "../../events/WebComponentCustomEvents";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const projectIdentifierChangedHandler = vi.fn();

beforeAll(() => {
  document.addEventListener(
    "editor-projectIdentifierChanged",
    projectIdentifierChangedHandler,
  );
});

let store;

describe("WebComponentProject", () => {
  beforeEach(() => {
    projectIdentifierChangedHandler.mockClear();
    const rootReducer = combineReducers({
      editor: EditorReducer,
      auth: WebComponentAuthSlice,
      instructions: InstructionsSlice,
    });
    const preloadedState = {
      editor: {
        project: {
          identifier: undefined,
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello world')",
            },
          ],
        },
        openFiles: [["main.py"]],
        focussedFileIndices: [1],
      },
      auth: {
        user: null,
      },
    };
    store = configureStore({ reducer: rootReducer, preloadedState });

    render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );
  });

  test("does not trigger projectIdentifierChanged event when identifier is not set", () => {
    expect(projectIdentifierChangedHandler).not.toHaveBeenCalled();
  });

  describe("when project identifier is changed", () => {
    beforeEach(() => {
      act(() => {
        store.dispatch(
          setProject({
            identifier: "new-identifier",
            components: [
              {
                name: "main",
                extension: "py",
                content: "print('hello world')",
              },
            ],
          }),
        );
      });
    });

    test("triggers projectIdentifierChanged event with new identifier", () => {
      expect(projectIdentifierChangedHandler).toHaveBeenCalledWith(
        projectIdentifierChangedEvent("new-identifier"),
      );
    });
  });

  describe("when a Scratch remix updates the project identifier", () => {
    beforeEach(() => {
      act(() => {
        store.dispatch(
          setProject({
            identifier: "teacher-project",
            project_type: "code_editor_scratch",
            components: [],
          }),
        );
      });
      projectIdentifierChangedHandler.mockClear();
      act(() => {
        store.dispatch(
          applyScratchProjectIdentifierUpdate({
            projectIdentifier: "student-remix",
          }),
        );
      });
    });

    test("triggers projectIdentifierChanged event with the remixed identifier", () => {
      expect(projectIdentifierChangedHandler).toHaveBeenCalledWith(
        projectIdentifierChangedEvent("student-remix"),
      );
    });
  });
});

describe("editor-codeChanged isInitialLoad", () => {
  const codeChangedHandler = vi.fn();
  const CODE_CHANGED_DEBOUNCE_MS = 2000;

  const flushCodeChangedDebounce = () => {
    act(() => {
      vi.advanceTimersByTime(CODE_CHANGED_DEBOUNCE_MS);
    });
  };

  const editCode = (content) => {
    act(() => {
      store.dispatch(
        updateProjectComponent({ name: "main", extension: "py", content }),
      );
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    codeChangedHandler.mockClear();
    document.addEventListener("editor-codeChanged", codeChangedHandler);

    const rootReducer = combineReducers({
      editor: EditorReducer,
      auth: WebComponentAuthSlice,
      instructions: InstructionsSlice,
    });
    store = configureStore({ reducer: rootReducer });
    // WebComponentLoader only mounts WebComponentProject after a load.
    store.dispatch(
      setProject({
        identifier: "loaded-project",
        project_type: "python",
        components: [
          {
            id: "main-id",
            name: "main",
            extension: "py",
            content: "print('hello')",
          },
        ],
      }),
    );

    render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );
  });

  afterEach(() => {
    document.removeEventListener("editor-codeChanged", codeChangedHandler);
    vi.useRealTimers();
  });

  test("flags the event fired by the project load", () => {
    flushCodeChangedDebounce();

    expect(codeChangedHandler).toHaveBeenCalledTimes(1);
    expect(codeChangedHandler.mock.lastCall[0].detail).toEqual(
      expect.objectContaining({ isInitialLoad: true }),
    );
  });

  test("does not flag a later user edit", () => {
    flushCodeChangedDebounce();
    editCode("print('edited')");
    flushCodeChangedDebounce();

    expect(codeChangedHandler).toHaveBeenCalledTimes(2);
    expect(codeChangedHandler.mock.lastCall[0].detail.isInitialLoad).toBe(
      false,
    );
  });

  test("does not flag an edit made before the load event fires", () => {
    editCode("print('edited')");
    flushCodeChangedDebounce();

    expect(codeChangedHandler).toHaveBeenCalledTimes(1);
    expect(codeChangedHandler.mock.lastCall[0].detail.isInitialLoad).toBe(
      false,
    );
  });

  test("does not fire when a save only resyncs the initial snapshot", () => {
    flushCodeChangedDebounce();
    editCode("print('edited')");
    flushCodeChangedDebounce();
    expect(codeChangedHandler).toHaveBeenCalledTimes(2);

    // Same identifier and no new files, so the reducer leaves the project
    // alone and only rebuilds the initial snapshot.
    act(() => {
      store.dispatch({
        type: "editor/saveProject/fulfilled",
        payload: { autosave: true, project: store.getState().editor.project },
      });
    });
    flushCodeChangedDebounce();

    expect(codeChangedHandler).toHaveBeenCalledTimes(2);
  });

  test("does not flag a Scratch identifier change after the load", () => {
    act(() => {
      store.dispatch(
        setProject({
          identifier: "teacher-project",
          project_type: "code_editor_scratch",
          components: [],
        }),
      );
    });
    flushCodeChangedDebounce();
    act(() => {
      store.dispatch(
        applyScratchProjectIdentifierUpdate({
          projectIdentifier: "student-remix",
        }),
      );
    });
    flushCodeChangedDebounce();

    expect(codeChangedHandler).toHaveBeenCalledTimes(2);
    expect(codeChangedHandler.mock.calls[0][0].detail.isInitialLoad).toBe(true);
    expect(codeChangedHandler.mock.calls[1][0].detail.isInitialLoad).toBe(
      false,
    );
  });
});

afterAll(() => {
  document.removeEventListener(
    "editor-projectIdentifierChanged",
    projectIdentifierChangedHandler,
  );
});
