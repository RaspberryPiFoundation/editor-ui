import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import HtmlRunner from "./HtmlRunner";
import { codeRunHandled, triggerCodeRun } from "../../../../redux/EditorSlice";
import { MemoryRouter } from "react-router-dom";
import { matchMedia, setMedia } from "mock-match-media";
import { MOBILE_BREAKPOINT } from "../../../../utils/mediaQueryBreakpoints";

let mockMediaQuery = (query) => {
  return matchMedia(query).matches;
};

jest.mock("react-responsive", () => ({
  ...jest.requireActual("react-responsive"),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

const indexPage = {
  name: "index",
  extension: "html",
  content: "<head></head><body><p>hello world</p></body>",
};
const anotherHTMLPage = {
  name: "amazing",
  extension: "html",
  content: "<head></head><body><p>My amazing page</p></body>",
};
const internalLinkHTMLPage = {
  name: "internal_link",
  extension: "html",
  content: '<head></head><body><a href="test.html">ANCHOR LINK!</a></body>',
};

const allowedExternalLink = {
  name: "allowed_external_link",
  extension: "html",
  content:
    '<head></head><body><a href="https://rpf.io/seefood">RPF link</a></body>',
};

describe("When page first loaded", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        justLoaded: true,
        autorunEnabled: false,
        codeHasBeenRun: false,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("iframe does not exist", () => {
    expect(screen.queryByTitle("runners.HtmlOutput")).not.toBeInTheDocument();
  });
});

describe("When focussed on another HTML file", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage, anotherHTMLPage],
        },
        focussedFileIndices: [1],
        openFiles: [["index.html", "amazing.html"]],
        errorModalShowing: false,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("iframe does not exist", () => {
    expect(screen.queryByTitle("runners.HtmlOutput")).not.toBeInTheDocument();
  });

  test("Does not show page related to focussed file", () => {
    expect(Blob).not.toHaveBeenCalled();
  });
});

describe("When page first loaded in embedded viewer", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        justLoaded: true,
        errorModalShowing: false,
        isEmbedded: true,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("iframe exists", () => {
    expect(screen.queryByTitle("runners.HtmlOutput")).toBeInTheDocument();
  });

  test("Dispatches action to trigger code run", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([triggerCodeRun()]),
    );
  });

  test("does not display link to open preview in another browser tab", () => {
    expect(screen.queryByText("output.newTab")).not.toBeInTheDocument();
  });
});

describe("When page first loaded from search params", () => {
  let store;

  beforeEach(async () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            { name: "a-new-test-page", extension: "html", content: "" },
          ],
        },
        focussedFileIndices: [0],
        openFiles: [[]],
        justLoaded: true,
        errorModalShowing: false,
        isEmbedded: true,
        page: "a-new-test-page.html",
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("iframe exists", () => {
    expect(screen.queryByTitle("runners.HtmlOutput")).toBeInTheDocument();
  });

  test("tab exists", () => {
    expect(
      screen.queryByText("a-new-test-page.html output.preview"),
    ).toBeInTheDocument();
  });

  test("Dispatches action to trigger code run", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([triggerCodeRun()]),
    );
  });
});

describe("When page does not exist", () => {
  let store;

  beforeEach(async () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [{ name: "index", extension: "html", content: "" }],
        },
        focussedFileIndices: [0],
        openFiles: [[]],
        justLoaded: true,
        errorModalShowing: false,
        isEmbedded: true,
        page: "a-new-test-page.html",
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Defaults to index.html", () => {
    expect(screen.queryByText("index.html output.preview")).toBeInTheDocument();
  });
});

describe("When run is triggered", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        codeRunTriggered: true,
        codeHasBeenRun: true,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Runs HTML code and adds meta tag", () => {
    const [generatedHtml] = Blob.mock.calls[0][0];

    expect(generatedHtml).toContain("<p>hello world</p>");
    expect(generatedHtml).toContain('<meta filename="index.html"');
  });

  test("Dispatches action to end code run", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([codeRunHandled()]),
    );
  });
});

describe("When a non-permitted external link is rendered", () => {
  let store;
  const input =
    '<head></head><body><a href="https://google.test/">EXTERNAL LINK!</a></body>';

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "index",
              extension: "html",
              content: input,
            },
          ],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        codeRunTriggered: true,
        codeHasBeenRun: true,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Transforms the external link and includes the meta tag", () => {
    const [generatedHtml] = Blob.mock.calls[0][0];

    expect(generatedHtml).toContain('<a href="javascript:void(0)"');
    expect(generatedHtml).toContain(
      "onclick=\"window.parent.postMessage({msg: 'ERROR: External link'})\"",
    );
    expect(generatedHtml).toContain("EXTERNAL LINK!");
    expect(generatedHtml).toContain('<meta filename="index.html"');
  });
});

describe("When a new tab link is rendered", () => {
  let store;
  const input =
    '<head></head><body><a href="index.html" target="_blank">NEW TAB LINK!</a></body>';

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            indexPage,
            {
              name: "some_file",
              extension: "html",
              content: input,
            },
          ],
        },
        focussedFileIndices: [1],
        openFiles: [["index.html", "some_file.html"]],
        codeRunTriggered: true,
        codeHasBeenRun: true,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Removes target attribute and adds onclick event", () => {
    const [generatedHtml] = Blob.mock.calls[0][0];

    expect(generatedHtml).not.toContain('target="_blank"');
    expect(generatedHtml).toContain('<a href="javascript:void(0)"');
    expect(generatedHtml).toContain(
      "onclick=\"window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: 'index' }})\"",
    );
    expect(generatedHtml).toContain("NEW TAB LINK!");
    expect(generatedHtml).toContain('<meta filename="some_file.html"');
  });
});

describe("When an internal link is rendered", () => {
  let store;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            internalLinkHTMLPage,
            {
              name: "test",
              extension: "html",
              content: "<p>test file</p>",
            },
          ],
        },
        focussedFileIndices: [0],
        openFiles: [["internal_link.html"]],
        codeRunTriggered: true,
        codeHasBeenRun: true,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Transforms internal link and includes meta tag", () => {
    const [generatedHtml] = Blob.mock.calls[0][0];

    expect(generatedHtml).toContain('<a href="javascript:void(0)"');
    expect(generatedHtml).toContain(
      "onclick=\"window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: 'test' }})\"",
    );
    expect(generatedHtml).toContain("ANCHOR LINK!");
    expect(generatedHtml).toContain('<meta filename="internal_link.html"');
  });
});

describe("When an allowed external link is rendered", () => {
  let store;
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [allowedExternalLink],
        },
        focussedFileIndices: [0],
        openFiles: [["allowed_external_link.html"]],
        codeRunTriggered: true,
        codeHasBeenRun: true,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Transforms allowed external link and includes meta tag", () => {
    const [generatedHtml] = Blob.mock.calls[0][0];

    expect(generatedHtml).toContain('<a href="https://rpf.io/seefood"');
    expect(generatedHtml).toContain(
      "onclick=\"window.parent.postMessage({msg: 'Allowed external link', payload: { linkTo: 'https://rpf.io/seefood' }})\"",
    );
    expect(generatedHtml).toContain("RPF link");
    expect(generatedHtml).toContain(
      '<meta filename="allowed_external_link.html"',
    );
  });
});

describe("When on desktop", () => {
  let store;

  beforeEach(() => {
    setMedia({
      width: "1000px",
    });
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        codeRunTriggered: true,
        codeHasBeenRun: true,
        errorModalShowing: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("There is no run button", () => {
    expect(screen.queryByText("runButton.run")).not.toBeInTheDocument();
  });
});

describe("When not embedded", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        codeHasBeenRun: true,
        isEmbedded: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("displays link to open preview in another browser tab", () => {
    expect(screen.queryByText("output.newTab")).toBeInTheDocument();
  });
});

describe("When on mobile but not embedded", () => {
  let store;

  beforeEach(() => {
    setMedia({
      width: MOBILE_BREAKPOINT,
    });

    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage],
        },
        focussedFileIndices: [0],
        openFiles: [["index.html"]],
        codeHasBeenRun: true,
        isEmbedded: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <HtmlRunner />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Has run button in tab bar", () => {
    const runButton =
      screen.getByText("runButton.run").parentElement.parentElement;
    const runButtonContainer = runButton.parentElement.parentElement;
    expect(runButtonContainer).toHaveClass("react-tabs__tab-container");
  });
});
