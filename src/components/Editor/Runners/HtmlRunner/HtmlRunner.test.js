import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { parse as parseHtml } from "node-html-parser";
import HtmlRunner from "./HtmlRunner";
import { triggerCodeRun } from "../../../../redux/EditorSlice";
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

jest.mock("node-html-parser", () => {
  const actual = jest.requireActual("node-html-parser");
  return {
    ...actual,
    parse: jest.fn((...args) => actual.parse(...args)),
  };
});

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
    expect(parseHtml).not.toHaveBeenCalled();
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
