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
} from "../../redux/EditorSlice";
import { projectIdentifierChangedEvent } from "../../events/WebComponentCustomEvents";

const projectIdentifierChangedHandler = jest.fn();

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

afterAll(() => {
  document.removeEventListener(
    "editor-projectIdentifierChanged",
    projectIdentifierChangedHandler,
  );
});
