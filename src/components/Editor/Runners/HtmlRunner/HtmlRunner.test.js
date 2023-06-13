import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import HtmlRunner from "./HtmlRunner";
import { codeRunHandled, triggerCodeRun } from "../../EditorSlice";
import { MemoryRouter } from "react-router-dom";

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
const allowedLinkHTMLPage = {
  name: "allowed_link",
  extension: "html",
  content: '<head></head><body><a href="#">ANCHOR LINK!</a></body>',
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
});

describe("When run run triggered", () => {
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

  test("Runs HTML code", () => {
    expect(Blob).toHaveBeenCalledWith([indexPage.content], {
      type: "text/html",
    });
  });

  test("Dispatches action to end code run", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([codeRunHandled()]),
    );
  });
});

describe("When an external link is rendered", () => {
  let store;
  const input =
    '<head></head><body><a href="https://google.com">EXTERNAL LINK!</a></body>';
  const output = `<head></head><body><a href="javascript:void(0)" onclick="window.parent.postMessage({msg: 'ERROR: External link'})">EXTERNAL LINK!</a></body>`;

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

  test("Runs HTML code without the link", () => {
    expect(Blob).toHaveBeenCalledWith([output], {
      type: "text/html",
    });
  });
});

describe("When a new tab link is rendered", () => {
  let store;
  const input =
    '<head></head><body><a href="index.html" target="_blank">NEW TAB LINK!</a></body>';
  const output = `<head></head><body><a href="javascript:void(0)" onclick="window.parent.postMessage({msg: 'RELOAD', payload: { linkTo: 'index' }})">NEW TAB LINK!</a></body>`;

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

  test("Runs HTML code removes target attribute", () => {
    expect(Blob).toHaveBeenCalledWith([output], {
      type: "text/html",
    });
  });
});

describe("When an allowed link is rendered", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [allowedLinkHTMLPage],
        },
        focussedFileIndices: [0],
        openFiles: [["allowed_link.html"]],
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

  test("Runs HTML code without changes", () => {
    expect(Blob).toHaveBeenCalledWith([allowedLinkHTMLPage.content], {
      type: "text/html",
    });
  });
});
