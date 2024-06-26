import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PythonRunner from "./PythonRunner";
import {
  codeRunHandled,
  setError,
  setErrorDetails,
  triggerDraw,
} from "../../../../redux/EditorSlice";
import { SettingsContext } from "../../../../utils/settings";
import { matchMedia, setMedia } from "mock-match-media";
import { MOBILE_BREAKPOINT } from "../../../../utils/mediaQueryBreakpoints";

let mockMediaQuery = (query) => {
  return matchMedia(query).matches;
};

jest.mock("react-responsive", () => ({
  ...jest.requireActual("react-responsive"),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

describe("Testing basic input span functionality", () => {
  let input;
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "input()",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
    input = document.getElementById("input");
  });

  test("Input function in code makes editable input box appear", () => {
    expect(input).toHaveAttribute("contentEditable", "true");
  });

  test("Input box has focus when it appears", () => {
    expect(input).toHaveFocus();
  });

  test("Clicking output pane transfers focus to input", () => {
    const outputPane = document.getElementsByClassName(
      "pythonrunner-console",
    )[0];
    fireEvent.click(outputPane);
    expect(input).toHaveFocus();
  });

  test("Pressing enter stops the input box being editable", () => {
    const inputText = "hello world";
    input.innerText = inputText;
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(input).not.toHaveAttribute("contentEditable", "true");
    expect(input.innerText).toBe(inputText + "\n");
  });
});

test("Input box not there when input function not called", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [
          {
            name: "main",
            extension: "py",
            content: "print('Hello')",
          },
        ],
        image_list: [],
      },
      codeRunTriggered: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
  expect(document.getElementById("input")).toBeNull();
});

describe("Testing stopping the code run with input", () => {
  let store;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "input()",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        codeRunStopped: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
  });

  test("Disables input span", () => {
    expect(document.getElementById("input")).toBeNull();
  });

  test("Sets interruption error", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([setError("output.errors.interrupted")]),
    );
  });

  test("Handles code run", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([codeRunHandled()]),
    );
  });
});

describe("When an error occurs", () => {
  let store;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "boom!",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
  });

  test("Sets error in state", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setError("SyntaxError: bad token T_OP on line 1 of main.py"),
      ]),
    );
  });

  test("Sets errorDetails in state", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setErrorDetails({
          type: "SyntaxError",
          line: 1,
          file: "main.py",
          description: "bad token T_OP",
          message: "SyntaxError: bad token T_OP on line 1 of main.py",
        }),
      ]),
    );
  });
});

describe("When an error has occurred", () => {
  let mockStore;
  let store;
  let initialState;

  beforeEach(() => {
    const middlewares = [];
    mockStore = configureStore(middlewares);
    initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "boom!",
            },
          ],
          image_list: [],
        },
        error: "SyntaxError: bad token T_OP on line 1 of main.py",
      },
      auth: {
        user,
      },
    };
  });

  test("Displays error message", () => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );

    expect(
      screen.getByText("SyntaxError: bad token T_OP on line 1 of main.py"),
    ).toBeVisible();
  });

  test("Does not display error message when isOutputOnly state is true", () => {
    initialState.editor.isOutputOnly = true;
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
    expect(
      screen.queryByText("SyntaxError: bad token T_OP on line 1 of main.py"),
    ).not.toBeInTheDocument();
  });
});

describe("When in split view, no visual libraries used and code run", () => {
  let store;
  let queryByText;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello world')",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonTabLabel"),
    ).not.toBeInTheDocument();
  });

  test("Visual tab is not shown", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).not.toBeInTheDocument();
  });
});

describe("When in split view, py5 imported and code run", () => {
  let store;
  let queryByText;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import py5",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonTabLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is shown", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });

  test("Draw is triggered", () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([triggerDraw()]));
  });
});

describe("When in split view, py5_imported imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import py5_imported",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonTabLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is shown", async () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in split view, pygal imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import pygal",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonTabLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is shown", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in split view, turtle imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import turtle",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonTabLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is shown", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in split view, sense_hat imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import _internal_sense_hat",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonTabLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is shown", async () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in tabbed view, no visual libraries used and code run", () => {
  let store;
  let queryByText;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello world')",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: false,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).not.toBeInTheDocument();
  });

  test("Visual tab is not shown", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).not.toBeInTheDocument();
  });
});

describe("When in tabbed view, py5 imported and code run", () => {
  let store;
  let queryByText;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import py5",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: false,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is not hidden", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });

  test("Draw is triggered", () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([triggerDraw()]));
  });
});

describe("When in tabbed view, py5_imported imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import py5_imported",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: false,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is not hidden", async () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in tabbed view, pygal imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import pygal",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: false,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is not hidden", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in tabbed view, turtle imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import turtle",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: false,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is not hidden", () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When in tabbed view, sense_hat imported and code run", () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import _internal_sense_hat",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
        isSplitView: false,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    ));
  });

  test("Output view toggle not shown", () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).toBeInTheDocument();
  });

  test("Visual tab is not hidden", async () => {
    const visualTab = queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

test("When embedded in split view with visual output does not render output view toggle", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [
          {
            name: "main",
            extension: "py",
            content: "import p5",
          },
        ],
        image_list: [],
      },
      codeRunTriggered: true,
      isSplitView: true,
      isEmbedded: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("When embedded in split view with no visual output does not render output view toggle", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
      senseHatAlwaysEnabled: false,
      isSplitView: true,
      isEmbedded: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("When embedded in tabbed view does not render output view toggle", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
      isSplitView: false,
      isEmbedded: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("Tabbed view has text and visual tabs with same parent element", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
      senseHatAlwaysEnabled: true,
      isSplitView: false,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
  expect(
    screen.getByText("output.visualOutput").parentElement.parentElement,
  ).toEqual(screen.getByText("output.textOutput").parentElement.parentElement);
});

test("Split view has text and visual tabs with different parent elements", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
      senseHatAlwaysEnabled: true,
      isSplitView: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
  expect(screen.getByText("output.visualOutput").parentElement).not.toEqual(
    screen.getByText("output.textOutput").parentElement,
  );
});

test("only displays text tab when outputPanels is set to just text", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
      senseHatAlwaysEnabled: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner outputPanels={["text"]} />
    </Provider>,
  );
  expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
  expect(screen.queryByText("output.visualOutput")).not.toBeInTheDocument();
});

test("only displays visual tab when outputPanels is set to just visual", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
      senseHatAlwaysEnabled: true,
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PythonRunner outputPanels={["visual"]} />
    </Provider>,
  );
  expect(screen.queryByText("output.textOutput")).not.toBeInTheDocument();
  expect(screen.queryByText("output.visualOutput")).toBeInTheDocument();
});

describe("When font size is set", () => {
  let runnerContainer;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
      },
      auth: {
        user,
      },
    };
    const store = mockStore(initialState);
    runnerContainer = render(
      <Provider store={store}>
        <SettingsContext.Provider
          value={{ theme: "dark", fontSize: "myFontSize" }}
        >
          <PythonRunner />
        </SettingsContext.Provider>
      </Provider>,
    );
  });

  test("Font size class is set correctly", () => {
    const runnerConsole = runnerContainer.container.querySelector(
      ".pythonrunner-console",
    );
    expect(runnerConsole).toHaveClass("pythonrunner-console--myFontSize");
  });
});

describe("When on desktop", () => {
  beforeEach(() => {
    setMedia({
      width: "1000px",
    });
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "print('Hello')",
            },
          ],
          image_list: [],
        },
      },
      auth: {
        user,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
  });

  test("There is no run button", () => {
    expect(screen.queryByText("runButton.run")).not.toBeInTheDocument();
  });
});

describe("When on mobile and not embedded", () => {
  beforeEach(() => {
    setMedia({
      width: MOBILE_BREAKPOINT,
    });
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "print('Hello')",
            },
          ],
          image_list: [],
        },
        isEmbedded: false,
      },
      auth: {
        user,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
  });

  test("Has a run button in the tab bar", () => {
    const runButton =
      screen.getByText("runButton.run").parentElement.parentElement;
    const runButtonContainer = runButton.parentElement.parentElement;
    expect(runButtonContainer).toHaveClass("react-tabs__tab-container");
  });
});
