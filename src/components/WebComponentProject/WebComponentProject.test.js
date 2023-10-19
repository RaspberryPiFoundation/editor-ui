import React from "react";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentProject from "./WebComponentProject";

const codeChangedHandler = jest.fn();
const runStartedHandler = jest.fn();
const runCompletedHandler = jest.fn();

beforeAll(() => {
  document.addEventListener("editor-codeChanged", codeChangedHandler);
  document.addEventListener("editor-runStarted", runStartedHandler);
  document.addEventListener("editor-runCompleted", runCompletedHandler);
});

jest.useFakeTimers();

let store;

describe("When code running", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            { name: "main", extension: "py", content: "print('hello')" },
          ],
        },
        openFiles: [],
        focussedFileIndices: [],
        codeRunTriggered: true,
      },
      auth: {},
    };
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );
  });

  test("Triggers codeChanged event", () => {
    act(() => {
      jest.runAllTimers();
    });
    expect(codeChangedHandler).toHaveBeenCalled();
  });

  test("Triggers runStarted event", () => {
    expect(runStartedHandler).toHaveBeenCalled();
  });
});

describe("When code run finishes", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            { name: "main", extension: "py", content: "print('hello')" },
          ],
        },
        openFiles: [],
        focussedFileIndices: [],
        codeRunTriggered: false,
        codeHasBeenRun: true,
      },
      auth: {},
    };
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );
  });

  test("Triggers runCompletedEvent", () => {
    expect(runCompletedHandler).toHaveBeenCalled();
  });
});

afterAll(() => {
  document.removeEventListener("editor-codeChanged", codeChangedHandler);
  document.removeEventListener("editor-runStarted", runStartedHandler);
  document.removeEventListener("editor-runCompleted", runCompletedHandler);
});
