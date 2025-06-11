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

const renderWebComponentProject = ({
  projectType,
  instructions,
  permitOverride = true,
  loading,
  codeRunTriggered = false,
  codeHasBeenRun = false,
  props = {},
}) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        project_type: projectType,
        components: [
          { name: "main", extension: "py", content: "print('hello')" },
        ],
        image_list: [],
        instructions,
      },
      loading,
      openFiles: [],
      focussedFileIndices: [],
      codeRunTriggered,
      codeHasBeenRun,
    },
    instructions: {
      currentStepPosition: 3,
      permitOverride,
    },
    auth: {},
  };
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <WebComponentProject {...props} />
    </Provider>,
  );
};

describe("When state set", () => {
  beforeEach(() => {
    renderWebComponentProject({
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
  test("Triggers runCompletedEvent", () => {
    renderWebComponentProject({ codeHasBeenRun: true });
    expect(runCompletedHandler).toHaveBeenCalled();
    expect(runCompletedHandler.mock.lastCall[0].detail).toHaveProperty(
      "isErrorFree",
    );
  });

  test("Triggers runCompletedEvent with error details when outputOnly is true", () => {
    renderWebComponentProject({
      codeHasBeenRun: true,
      props: { outputOnly: true },
    });
    expect(runCompletedHandler).toHaveBeenCalled();
    expect(runCompletedHandler.mock.lastCall[0].detail).toHaveProperty(
      "errorDetails",
    );
  });
});

describe("When withSidebar is true", () => {
  beforeEach(() => {
    renderWebComponentProject({
      props: { withSidebar: true, sidebarOptions: ["settings"] },
    });
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
