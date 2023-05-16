import configureStore from "redux-mock-store";
import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import HtmlRunner from "./HtmlRunner";
import { codeRunHandled } from "../../EditorSlice";

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
const stylesheet = {
  name: "styles",
  extension: "css",
  content: "p {color: red}",
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

  test("iframe exists", () => {
    const iframe = document.getElementsByClassName("htmlrunner-iframe")[0];
    expect(iframe).toBeInTheDocument();
  });

  test("Runs HTML code", async () => {
    expect(Blob).toHaveBeenCalledWith([indexPage.content], {
      type: "text/html",
    });
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
        <div id="app">
          <HtmlRunner />
        </div>
      </Provider>
    );
  });

  test("Shows page related to focussed file", () => {
    expect(Blob).toHaveBeenCalledWith([anotherHTMLPage.content], {
      type: "text/html",
    });
  });
});

describe("When focussed on CSS file", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [indexPage, stylesheet],
        },
        focussedFileIndices: [1],
        openFiles: [["index.html", "styles.css"]],
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
    '<head></head><body><a href="https://google.com">EXTERNAL LINK!</a></body>';
  const output = `<head></head><body><a href="javascript:void(0)" onclick="window.parent.postMessage('ERROR: External link')">EXTERNAL LINK!</a></body>`;

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
