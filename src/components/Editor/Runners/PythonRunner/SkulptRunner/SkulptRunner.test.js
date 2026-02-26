import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Sk from "skulpt";

import SkulptRunner from "./SkulptRunner";
import {
  codeRunHandled,
  setError,
  setErrorDetails,
  triggerDraw,
} from "../../../../../redux/EditorSlice";
import { SettingsContext } from "../../../../../utils/settings";
import { matchMedia, setMedia } from "mock-match-media";
import { MOBILE_BREAKPOINT } from "../../../../../utils/mediaQueryBreakpoints";

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
        <SkulptRunner active={true} />
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
      <SkulptRunner active={true} />
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
        codeRunStopped: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SkulptRunner active={true} />
        <span id="input"></span>
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
        <SkulptRunner active={true} />
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

describe("When an error originates in the sense_hat shim", () => {
  let store;

  // This initialState sets up a file `sense_hat.py` which contains code that
  // will raise an error if the set_pixel function is called with an x
  // value greater than 7 or less than 0. The `main.py` file then calls this
  // function with an x value of 255, which will cause the error to be raised.
  //
  // This file matches the name looked for in the SkulptRunner
  // (`./sense_hat.py`), so the SkulptRunner should attribute the error to the
  // user's `main.py` file and not the `sense_hat.py` shim file, and set the
  // errorDetails accordingly.
  //
  // This test has to be run this way because the sense hat libray is loaded
  // via `fetch()` from a remote URL, which is hard to do in the test
  // environment.
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
              content:
                "from sense_hat import set_pixel\nset_pixel(255, 0, 0, 0, 0)",
            },
            {
              name: "sense_hat",
              extension: "py",
              content:
                "def set_pixel(x, y, r, g, b):\n" +
                "    if x > 7 or x < 0:\n" +
                "        raise ValueError('X position must be between 0 and 7')\n",
            },
          ],
          image_list: [],
        },
        codeRunTriggered: true,
      },
      auth: { user },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SkulptRunner active={true} />
      </Provider>,
    );
  });

  test("reports the error at the user's line, not the shim's line", () => {
    expect(store.getActions()).toContainEqual(
      setError(
        "ValueError: X position must be between 0 and 7 on line 2 of main.py",
      ),
    );
  });

  test("sets errorDetails pointing to the user's code, not the shim", () => {
    expect(store.getActions()).toContainEqual(
      setErrorDetails({
        type: "ValueError",
        line: 2,
        file: "main.py",
        description: "X position must be between 0 and 7",
        message:
          "ValueError: X position must be between 0 and 7 on line 2 of main.py",
      }),
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
        <SkulptRunner active={true} />
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
        <SkulptRunner active={true} />
      </Provider>,
    );
    expect(
      screen.queryByText("SyntaxError: bad token T_OP on line 1 of main.py"),
    ).not.toBeInTheDocument();
  });
});

describe("When there is an import error and the site is cross-origin isolated", () => {
  let store;
  beforeEach(() => {
    window.crossOriginIsolated = true;
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "import fake_module",
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
        <SkulptRunner active={true} />
      </Provider>,
    );
  });
  test("it shows the original error message and the explanation", () => {
    expect(store.getActions()).toContainEqual(
      setError(
        `ImportError: No module named fake_module on line 1 of main.py. You should check your code for typos. If you are using p5, py5, sense_hat or turtle, fake_module might not work - read this <a href=https://help.editor.raspberrypi.org/hc/en-us/articles/30841379339924-What-Python-libraries-are-available-in-the-Code-Editor>article</a> for more information.`,
      ),
    );
  });
});

// describe("When in split view, no visual libraries used and code run", () => {
//   let store;
//   let queryByText;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: {
//           components: [
//             {
//               name: "main",
//               extension: "py",
//               content: "print('hello world')",
//             },
//           ],
//           image_list: [],
//         },
//         codeRunTriggered: true,
//         isSplitView: true,
//       },
//       auth: {
//         user,
//       },
//     };
//     store = mockStore(initialState);
//     ({ queryByText } = render(
//       <Provider store={store}>
//         <SkulptRunner />
//       </Provider>,
//     ));
//   });

//   test("Output view toggle not shown", () => {
//     expect(
//       screen.queryByText("outputViewToggle.buttonTabLabel"),
//     ).not.toBeInTheDocument();
//   });

//   test("Visual tab is not shown", () => {
//     const visualTab = queryByText("output.visualOutput");
//     expect(visualTab).not.toBeInTheDocument();
//   });
// });

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
        <SkulptRunner active={true} />
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
              content: "# input.comment.py5",
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
        <SkulptRunner active={true} />
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
        <SkulptRunner active={true} />
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
        <SkulptRunner active={true} />
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
              content: "import sense_hat",
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
        <SkulptRunner active={true} />
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

// describe("When in tabbed view, no visual libraries used and code run", () => {
//   let store;
//   let queryByText;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: {
//           components: [
//             {
//               name: "main",
//               extension: "py",
//               content: "print('hello world')",
//             },
//           ],
//           image_list: [],
//         },
//         codeRunTriggered: true,
//         isSplitView: false,
//       },
//       auth: {
//         user,
//       },
//     };
//     store = mockStore(initialState);
//     ({ queryByText } = render(
//       <Provider store={store}>
//         <SkulptRunner />
//       </Provider>,
//     ));
//   });

//   test("Output view toggle not shown", () => {
//     expect(
//       screen.queryByText("outputViewToggle.buttonSplitLabel"),
//     ).not.toBeInTheDocument();
//   });

//   test("Visual tab is not shown", () => {
//     const visualTab = queryByText("output.visualOutput");
//     expect(visualTab).not.toBeInTheDocument();
//   });
// });

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
        <SkulptRunner active={true} />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
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
              content: "# input.comment.py5",
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
        <SkulptRunner active={true} />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
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
        <SkulptRunner active={true} />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
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
        <SkulptRunner active={true} />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
    screen.debug();
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
              content: "import sense_hat",
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
        <SkulptRunner active={true} />
      </Provider>,
    ));
  });

  test("Output view toggle is shown", () => {
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
      <SkulptRunner active={true} />
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
      <SkulptRunner active={true} />
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
      <SkulptRunner active={true} />
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
      <SkulptRunner active={true} />
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
      <SkulptRunner active={true} />
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
      <SkulptRunner outputPanels={["text"]} />
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
      <SkulptRunner outputPanels={["visual"]} />
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
          <SkulptRunner active={true} />
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
        <SkulptRunner active={true} />
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
        <SkulptRunner active={true} />
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

describe("When active and first loaded", () => {
  beforeEach(() => {
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
        <SkulptRunner active={true} />,
      </Provider>,
    );
  });

  test("it renders successfully", () => {
    expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
  });

  test("it does have active styles", () => {
    const element = document.querySelector(".skulptrunner");
    expect(element).toHaveClass("skulptrunner--active");
  });
});

describe("When not active", () => {
  beforeEach(() => {
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
        <SkulptRunner active={false} />,
      </Provider>,
    );
  });

  test("it does not have active styles", () => {
    const element = document.querySelector(".skulptrunner");
    expect(element).not.toHaveClass("skulptrunner--active");
  });
});

describe("When not active and a code run has been triggered", () => {
  beforeEach(() => {
    Sk.misceval.asyncToPromise = jest.fn();
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
        codeRunTriggered: true,
      },
      auth: {
        user,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SkulptRunner active={false} />,
      </Provider>,
    );
  });

  test("it does not run the code", () => {
    expect(Sk.misceval.asyncToPromise).not.toHaveBeenCalled();
  });
});
