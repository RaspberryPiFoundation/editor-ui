import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import HtmlRunner from "./HtmlRunner";
import { codeRunHandled } from "../../EditorSlice";

const indexPage = {
  name: "index",
  extension: "html",
  content:
    '<!DOCTYPE html><html lang="en"><head></head><body><p>hello world</p></body></html>',
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
        <div id="app">
          <HtmlRunner />
        </div>
      </Provider>
    );
  });

  test("iframe does not exist", () => {
    expect(screen.queryByTitle('runners.HtmlOutput')).not.toBeInTheDocument()
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
        isEmbedded: true
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <HtmlRunner />
        </div>
      </Provider>
    );
  });

  test("iframe exists", () => {
    expect(screen.queryByTitle('runners.HtmlOutput')).toBeInTheDocument()
  });

  test("Runs HTML code", async () => {
    expect(Blob).toHaveBeenCalledWith([indexPage.content], {
      type: "text/html",
    });
  });
});

describe("When run button clicked", () => {
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
        <div id="app">
          <HtmlRunner />
        </div>
      </Provider>
    );
  });

  test("Runs HTML code", () => {
    expect(Blob).toHaveBeenCalledWith([indexPage.content], {
      type: "text/html",
    });
  });

  test("Dispatches action to end code run", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([codeRunHandled()])
    );
  });
});

describe("When an external link is clicked", () => {
  let store;
  const input =
    '<!DOCTYPE html><html lang="en"><head></head><body><a href="https://google.com">EXTERNAL LINK!</a></body></html>';
  const output = `<!DOCTYPE html><html lang="en"><head></head><body><a href="#" onclick="window.parent.postMessage('ERROR: External link')">EXTERNAL LINK!</a></body></html>`;

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
        <div id="app">
          <HtmlRunner />
        </div>
      </Provider>
    );
  });

  test("Runs HTML code without the link", () => {
    expect(Blob).toHaveBeenCalledWith([output], {
      type: "text/html",
    });
  });
});
