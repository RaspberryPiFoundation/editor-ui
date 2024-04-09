import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentProject from "./WebComponentProject";

const codeChangedHandler = jest.fn();
const runStartedHandler = jest.fn();
const runCompletedHandler = jest.fn();
const stepChangedHandler = jest.fn();

beforeAll(() => {
  document.addEventListener("editor-codeChanged", codeChangedHandler);
  document.addEventListener("editor-runStarted", runStartedHandler);
  document.addEventListener("editor-runCompleted", runCompletedHandler);
  document.addEventListener("editor-stepChanged", stepChangedHandler);
});

jest.useFakeTimers();

let store;

describe("When state set", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            { name: "main", extension: "py", content: "print('hello')" },
          ],
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
        codeRunTriggered: true,
      },
      instructions: {
        currentStepPosition: 3,
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

  test("Triggers stepChanged event", () => {
    expect(stepChangedHandler).toHaveBeenCalled();
  });

  test("Defaults to not showing the sidebar", () => {
    expect(screen.queryByTitle("sidebar.expand")).not.toBeInTheDocument();
  });

  test("Defaults to not showing the projectbar", () => {
    expect(screen.queryByText("header.newProject")).not.toBeInTheDocument();
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
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
        codeRunTriggered: false,
        codeHasBeenRun: true,
      },
      instructions: {},
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

describe("When withSidebar is true", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            { name: "main", extension: "py", content: "print('hello')" },
          ],
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
      },
      instructions: {},
      auth: {},
    };
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <WebComponentProject withSidebar={true} sidebarOptions={["settings"]} />
      </Provider>,
    );
  });

  test("Renders the sidebar", () => {
    expect(screen.queryByTitle("sidebar.collapse")).toBeInTheDocument();
  });

  test("Renders the correct sidebar options", () => {
    expect(screen.queryByTitle("sidebar.settings")).toBeInTheDocument();
  });
});

describe("When withProjectbar is true", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            { name: "main", extension: "py", content: "print('hello')" },
          ],
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
        loading: "success",
      },
      instructions: {},
      auth: {},
    };
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <WebComponentProject withProjectbar={true} />
      </Provider>,
    );
  });

  test("Renders the projectbar", () => {
    expect(screen.queryByText("header.newProject")).toBeInTheDocument();
  });
});

afterAll(() => {
  document.removeEventListener("editor-codeChanged", codeChangedHandler);
  document.removeEventListener("editor-runStarted", runStartedHandler);
  document.removeEventListener("editor-runCompleted", runCompletedHandler);
  document.removeEventListener("editor-stepChanged", stepChangedHandler);
});
