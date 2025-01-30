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
          images: [],
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
          images: [],
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
    expect(runCompletedHandler.mock.lastCall[0].detail).toHaveProperty(
      "isErrorFree",
    );
  });

  test("Triggers runCompletedEvent with error details when outputOnly is true", () => {
    render(
      <Provider store={store}>
        <WebComponentProject outputOnly={true} />
      </Provider>,
    );
    expect(runCompletedHandler).toHaveBeenCalled();
    expect(runCompletedHandler.mock.lastCall[0].detail).toHaveProperty(
      "errorDetails",
    );
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
          images: [],
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
          images: [],
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

describe("When output_only is true", () => {
  let mockStore;
  let initialState;

  beforeEach(() => {
    const middlewares = [];
    mockStore = configureStore(middlewares);
    initialState = {
      editor: {
        project: {
          components: [],
        },
        openFiles: [],
        focussedFileIndices: [],
      },
      instructions: {},
      auth: {},
    };
  });

  describe("when loading is pending", () => {
    beforeEach(() => {
      initialState.editor.loading = "pending";
      store = mockStore(initialState);

      render(
        <Provider store={store}>
          <WebComponentProject outputOnly={true} />
        </Provider>,
      );
    });

    test("sets isOutputOnly state to true", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          { type: "editor/setIsOutputOnly", payload: true },
        ]),
      );
    });

    test("does not render anything", () => {
      expect(screen.queryByTestId("output")).not.toBeInTheDocument();
    });
  });

  describe("when loading is success", () => {
    beforeEach(() => {
      initialState.editor.loading = "success";
      store = mockStore(initialState);

      render(
        <Provider store={store}>
          <WebComponentProject outputOnly={true} />
        </Provider>,
      );
    });

    test("only renders the output", () => {
      expect(screen.queryByTestId("output")).toBeInTheDocument();
      expect(screen.queryByTestId("project")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mobile-project")).not.toBeInTheDocument();
    });

    test("styles output like embedded viewer", () => {
      expect(screen.getByTestId("output-only")).toHaveClass("embedded-viewer");
    });
  });
});

describe("outputSplitView property", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [],
        },
        openFiles: [],
        focussedFileIndices: [],
      },
      instructions: {},
      auth: {},
    };
    store = mockStore(initialState);
  });

  describe("when property is not set", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <WebComponentProject />
        </Provider>,
      );
    });

    test("sets isSplitView state to false by default", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          { type: "editor/setIsSplitView", payload: false },
        ]),
      );
    });
  });

  describe("when property is false", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <WebComponentProject outputSplitView={false} />
        </Provider>,
      );
    });

    test("sets isSplitView state to false", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          { type: "editor/setIsSplitView", payload: false },
        ]),
      );
    });
  });

  describe("when property is true", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <WebComponentProject outputSplitView={true} />
        </Provider>,
      );
    });

    test("sets isSplitView state to true", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          { type: "editor/setIsSplitView", payload: true },
        ]),
      );
    });
  });
});

afterAll(() => {
  document.removeEventListener("editor-codeChanged", codeChangedHandler);
  document.removeEventListener("editor-runStarted", runStartedHandler);
  document.removeEventListener("editor-runCompleted", runCompletedHandler);
  document.removeEventListener("editor-stepChanged", stepChangedHandler);
});
