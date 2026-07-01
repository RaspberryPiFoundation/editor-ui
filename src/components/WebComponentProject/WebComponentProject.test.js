import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentProject, {
  resetCodeRunEventTracking,
} from "./WebComponentProject";

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

beforeEach(() => {
  resetCodeRunEventTracking();
});

let store;

const renderWebComponentProject = ({
  projectType,
  instructions,
  imageList = [],
  permitOverride = true,
  loading,
  codeRunTriggered = false,
  codeHasBeenRun = false,
  error = "",
  errorDetails,
  friendlyError,
  props = {},
}) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        identifier: "test-project",
        project_type: projectType,
        components: [
          { name: "main", extension: "py", content: "print('hello')" },
        ],
        image_list: imageList,
        instructions,
      },
      loading,
      openFiles: [],
      focussedFileIndices: [],
      codeRunTriggered,
      codeHasBeenRun,
      error,
      errorDetails,
      friendlyError,
    },
    instructions: {
      currentStepPosition: 3,
      permitOverride,
    },
    auth: {},
  };
  store = mockStore(initialState);

  return render(
    <Provider store={store}>
      <WebComponentProject {...props} />
    </Provider>,
  );
};

describe("When state set", () => {
  beforeEach(() => {
    runStartedHandler.mockClear();
    renderWebComponentProject({
      projectType: "python",
      instructions: "My amazing instructions",
      codeRunTriggered: true,
    });
  });

  test("Renders", () => {
    expect(screen.queryAllByText("output.textOutput")[0]).toBeInTheDocument();
  });

  test("Triggers codeChanged event", () => {
    act(() => {
      jest.runAllTimers();
    });
    expect(codeChangedHandler).toHaveBeenCalled();
    expect(codeChangedHandler.mock.lastCall[0].detail).toHaveProperty("step");
  });

  test("Triggers runStarted event once", () => {
    expect(runStartedHandler).toHaveBeenCalledTimes(1);
    expect(runStartedHandler.mock.lastCall[0].detail).toEqual(
      expect.objectContaining({
        step: 3,
        projectIdentifier: "test-project",
        projectType: "python",
      }),
    );
  });

  test("Triggers stepChanged event", () => {
    expect(stepChangedHandler).toHaveBeenCalled();
    expect(stepChangedHandler.mock.lastCall[0].detail).toBe(3);
  });

  test("Defaults to not showing the sidebar", () => {
    expect(screen.queryByTitle("sidebar.expand")).not.toBeInTheDocument();
  });

  test("Defaults to not showing the projectbar", () => {
    expect(screen.queryByText("header.newProject")).not.toBeInTheDocument();
  });

  test("Dispatches action to set instructions", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        {
          type: "instructions/setInstructions",
          payload: {
            permitOverride: true,
            project: {
              steps: [
                {
                  title: "",
                  content: "<p>My amazing instructions</p>\n",
                  quiz: false,
                },
              ],
            },
          },
        },
      ]),
    );
  });
});

describe("When project type is scratch", () => {
  beforeEach(() => {
    renderWebComponentProject({
      projectType: "scratch",
    });
  });

  test("Renders a blank screen", () => {
    expect(screen.queryByText("output.textOutput")).not.toBeInTheDocument();
  });
});

describe("When there are instructions", () => {
  beforeEach(() => {
    renderWebComponentProject({
      instructions: "[Link](https://example.com)",
      codeRunTriggered: true,
    });
  });

  test("Renders a tag with target _blank", () => {
    const instructions = store
      .getActions()
      .find((e) => e.type === "instructions/setInstructions");

    const content = instructions.payload.project.steps[0].content;

    expect(content).toEqual(
      '<p><a href="https://example.com" target="_blank" rel="noreferrer"\n    }">Link</a></p>\n',
    );
  });
});

describe("When instructions are an empty string", () => {
  beforeEach(() => {
    renderWebComponentProject({
      instructions: "",
      codeRunTriggered: true,
    });
  });

  test("Dispatches action to set instructions", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        {
          type: "instructions/setInstructions",
          payload: {
            permitOverride: true,
            project: {
              steps: [
                {
                  title: "",
                  content: "",
                  quiz: false,
                },
              ],
            },
          },
        },
      ]),
    );
  });
});

describe("When there are no instructions", () => {
  beforeEach(() => {
    renderWebComponentProject({});
  });

  test("Does not dispatch action to set instructions", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        {
          type: "instructions/setInstructions",
          payload: {
            permitOverride: true,
            project: {
              steps: [],
            },
          },
        },
      ]),
    );
  });
});

describe("When overriding instructions is not permitted", () => {
  beforeEach(() => {
    renderWebComponentProject({
      instructions: "My amazing instructions",
      permitOverride: false,
    });
  });

  test("Does not dispatch action to set instructions", () => {
    expect(store.getActions()).not.toEqual(
      expect.arrayContaining([
        {
          type: "instructions/setInstructions",
          payload: expect.any(Object),
        },
      ]),
    );
  });
});

describe("When code run finishes", () => {
  const renderRunCompletion = (editorOverrides = {}, props = {}) => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const baseEditor = {
      project: {
        identifier: "test-project",
        project_type: "python",
        components: [
          { name: "main", extension: "py", content: "print('hello')" },
        ],
        image_list: [],
      },
      loading: "success",
      openFiles: [],
      focussedFileIndices: [],
      codeRunTriggered: true,
      codeHasBeenRun: true,
      error: "",
      errorDetails: undefined,
      friendlyError: undefined,
      ...editorOverrides,
    };
    const initialState = {
      editor: baseEditor,
      instructions: {
        currentStepPosition: 3,
        permitOverride: true,
      },
      auth: {},
    };
    store = mockStore(initialState);

    const view = render(
      <Provider store={store}>
        <WebComponentProject {...props} />
      </Provider>,
    );

    store = mockStore({
      ...initialState,
      editor: { ...baseEditor, codeRunTriggered: false },
    });

    view.rerender(
      <Provider store={store}>
        <WebComponentProject {...props} />
      </Provider>,
    );

    return view;
  };

  beforeEach(() => {
    runCompletedHandler.mockClear();
  });

  test("Triggers runCompletedEvent", () => {
    renderRunCompletion();
    expect(runCompletedHandler).toHaveBeenCalledTimes(1);
    expect(runCompletedHandler.mock.lastCall[0].detail).toEqual(
      expect.objectContaining({
        isErrorFree: true,
        step: 3,
        projectIdentifier: "test-project",
        projectType: "python",
        errorDetails: undefined,
        friendlyErrorShown: false,
      }),
    );
  });

  test("includes error details and friendly error state when a run failed", () => {
    renderRunCompletion({
      error: "NameError: name 'kettle' is not defined on line 5 of main.py",
      errorDetails: {
        type: "NameError",
        file: "main.py",
        line: 5,
        description: "name 'kettle' is not defined",
      },
      friendlyError: {
        html: "<p>Friendly error</p>",
      },
    });

    expect(runCompletedHandler).toHaveBeenCalledTimes(1);
    expect(runCompletedHandler.mock.lastCall[0].detail).toEqual(
      expect.objectContaining({
        isErrorFree: false,
        errorDetails: {
          type: "NameError",
          file: "main.py",
          line: 5,
          description: "name 'kettle' is not defined",
        },
        friendlyErrorShown: true,
        projectIdentifier: "test-project",
        projectType: "python",
      }),
    );
  });

  test("Triggers runCompletedEvent with error details when outputOnly is true", () => {
    renderRunCompletion({}, { outputOnly: true });
    expect(runCompletedHandler).toHaveBeenCalledTimes(1);
    expect(runCompletedHandler.mock.lastCall[0].detail).toEqual(
      expect.objectContaining({
        errorDetails: undefined,
        step: 3,
        projectIdentifier: "test-project",
        projectType: "python",
      }),
    );
  });

  test("does not trigger runCompletedEvent again when error state updates after the run ends", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const editor = {
      project: {
        identifier: "test-project",
        project_type: "python",
        components: [
          { name: "main", extension: "py", content: "print('hello')" },
        ],
        image_list: [],
      },
      loading: "success",
      openFiles: [],
      focussedFileIndices: [],
      codeRunTriggered: true,
      codeHasBeenRun: true,
      error: "",
      errorDetails: undefined,
      friendlyError: undefined,
    };
    const instructions = {
      currentStepPosition: 3,
      permitOverride: true,
    };

    store = mockStore({ editor, instructions, auth: {} });

    const view = render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    store = mockStore({
      editor: { ...editor, codeRunTriggered: false },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(1);

    store = mockStore({
      editor: {
        ...editor,
        codeRunTriggered: false,
        error: "NameError: name 'kettle' is not defined on line 5 of main.py",
        errorDetails: {
          type: "NameError",
          file: "main.py",
          line: 5,
          description: "name 'kettle' is not defined",
        },
        friendlyError: {
          html: "<p>Friendly error</p>",
        },
      },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(1);
  });
});

describe("When code is unchanged between runs", () => {
  const middlewares = [];
  const mockStoreFactory = configureStore(middlewares);

  const baseEditor = {
    project: {
      identifier: "test-project",
      project_type: "python",
      components: [
        { name: "main", extension: "py", content: "print('hello')" },
      ],
      image_list: [],
    },
    loading: "success",
    openFiles: [],
    focussedFileIndices: [],
    error: "",
    errorDetails: undefined,
    friendlyError: undefined,
  };

  const renderRunCycle = (editorOverrides = {}) => {
    const editor = { ...baseEditor, ...editorOverrides };
    const instructions = {
      currentStepPosition: 3,
      permitOverride: true,
    };

    store = mockStoreFactory({ editor, instructions, auth: {} });

    const view = render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    return { view, editor, instructions };
  };

  beforeEach(() => {
    runStartedHandler.mockClear();
    runCompletedHandler.mockClear();
  });

  test("does not emit run events on repeated runs with the same code", () => {
    const { view, editor, instructions } = renderRunCycle({
      codeRunTriggered: true,
    });

    expect(runStartedHandler).toHaveBeenCalledTimes(1);

    store = mockStoreFactory({
      editor: { ...editor, codeRunTriggered: false, codeHasBeenRun: true },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(1);

    store = mockStoreFactory({
      editor: { ...editor, codeRunTriggered: true, codeHasBeenRun: true },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runStartedHandler).toHaveBeenCalledTimes(1);

    store = mockStoreFactory({
      editor: { ...editor, codeRunTriggered: false },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(1);
  });

  test("emits run events again after code changes", () => {
    const { view, editor, instructions } = renderRunCycle({
      codeRunTriggered: true,
    });

    store = mockStoreFactory({
      editor: { ...editor, codeRunTriggered: false, codeHasBeenRun: true },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    const updatedEditor = {
      ...editor,
      project: {
        ...editor.project,
        components: [
          { name: "main", extension: "py", content: "print('world')" },
        ],
      },
      codeRunTriggered: true,
      codeHasBeenRun: true,
    };

    store = mockStoreFactory({
      editor: updatedEditor,
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runStartedHandler).toHaveBeenCalledTimes(2);

    store = mockStoreFactory({
      editor: { ...updatedEditor, codeRunTriggered: false },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(2);
  });

  test("emits run events on repeated runs when read only", () => {
    const { view, editor, instructions } = renderRunCycle({
      codeRunTriggered: true,
      readOnly: true,
    });

    expect(runStartedHandler).toHaveBeenCalledTimes(1);

    store = mockStoreFactory({
      editor: { ...editor, codeRunTriggered: false, codeHasBeenRun: true },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(1);

    store = mockStoreFactory({
      editor: {
        ...editor,
        codeRunTriggered: true,
        codeHasBeenRun: true,
        readOnly: true,
      },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runStartedHandler).toHaveBeenCalledTimes(2);

    store = mockStoreFactory({
      editor: { ...editor, codeRunTriggered: false, readOnly: true },
      instructions,
      auth: {},
    });
    view.rerender(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runCompletedHandler).toHaveBeenCalledTimes(2);
  });
});

describe("When remounted during a run", () => {
  beforeEach(() => {
    runStartedHandler.mockClear();
  });

  test("does not trigger runStarted again", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          identifier: "test-project",
          project_type: "python",
          components: [
            { name: "main", extension: "py", content: "print('hello')" },
          ],
          image_list: [],
        },
        loading: "success",
        openFiles: [],
        focussedFileIndices: [],
        codeRunTriggered: true,
        codeHasBeenRun: true,
      },
      instructions: {
        currentStepPosition: 3,
        permitOverride: true,
      },
      auth: {},
    };
    const store = mockStore(initialState);

    const view = render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runStartedHandler).toHaveBeenCalledTimes(1);

    view.unmount();

    render(
      <Provider store={store}>
        <WebComponentProject />
      </Provider>,
    );

    expect(runStartedHandler).toHaveBeenCalledTimes(1);
  });
});

describe("When withSidebar is true", () => {
  beforeEach(() => {
    renderWebComponentProject({
      props: { withSidebar: true, sidebarOptions: ["settings"] },
    });
  });

  test("Renders the sidebar", () => {
    expect(screen.queryByTitle("sidebar.expand")).toBeInTheDocument();
  });

  test("Renders the correct sidebar options", () => {
    expect(screen.queryByTitle("sidebar.settings")).toBeInTheDocument();
  });
});

describe("When withProjectbar is true", () => {
  beforeEach(() => {
    renderWebComponentProject({
      loading: "success",
      props: { withProjectbar: true },
    });
  });

  test("Renders the projectbar", () => {
    expect(screen.queryByText("header.newProject")).toBeInTheDocument();
  });
});

describe("When output_only is true", () => {
  describe("when loading is pending", () => {
    beforeEach(() => {
      renderWebComponentProject({
        loading: "pending",
        props: { outputOnly: true },
      });
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
      renderWebComponentProject({
        loading: "success",
        props: { outputOnly: true },
      });
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
  describe("when property is not set", () => {
    beforeEach(() => {
      renderWebComponentProject({});
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
      renderWebComponentProject({ props: { outputSplitView: false } });
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
      renderWebComponentProject({ props: { outputSplitView: true } });
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
