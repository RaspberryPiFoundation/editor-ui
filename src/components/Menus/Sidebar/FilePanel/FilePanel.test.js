import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import FilePanel from "./FilePanel";
import { openFile, setFocussedFileIndex } from "../../../../redux/EditorSlice";

import "../../../../consoleMock";

const createMockStore = function ({ components, openFiles = [[]], readOnly }) {
  const mockStore = configureStore([]);
  return mockStore({
    editor: {
      project: {
        components,
      },
      isEmbedded: false,
      openFiles,
      readOnly,
    },
    auth: {
      user: null,
    },
  });
};

let store;

describe("When project has multiple files", () => {
  beforeEach(() => {
    store = createMockStore({
      components: [
        {
          name: "a",
          extension: "py",
        },
        {
          name: "b",
          extension: "html",
        },
        {
          name: "c",
          extension: "css",
        },
        {
          name: "d",
          extension: "csv",
        },
      ],
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );
  });

  test("Renders all file names", () => {
    expect(screen.queryByText("a.py")).not.toBeNull();
    expect(screen.queryByText("b.html")).not.toBeNull();
    expect(screen.queryByText("c.css")).not.toBeNull();
    expect(screen.queryByText("d.csv")).not.toBeNull();
  });

  test("Renders a menu button for each file", () => {
    expect(screen.getAllByTitle("filePanel.fileMenu.label").length).toBe(4);
  });

  test("Clicking file name opens file tab", () => {
    fireEvent.click(screen.queryByText("a.py").parentElement);
    expect(store.getActions()).toEqual([
      openFile("a.py"),
      setFocussedFileIndex({ fileIndex: 0, panelIndex: 0 }),
    ]);
  });

  test("it renders with the expected icons", () => {
    expect(screen.getByTestId("pythonIcon")).toBeTruthy();
    expect(screen.getByTestId("htmlIcon")).toBeTruthy();
    expect(screen.getByTestId("cssIcon")).toBeTruthy();
    expect(screen.getByTestId("csvIcon")).toBeTruthy();
  });
});

describe("it renders the expected icon for individual files", () => {
  test("it renders the expected icon for an individual python file", () => {
    const store = createMockStore({
      components: [{ name: "a", extension: "py" }],
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePanel.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("pythonIcon")).toBeTruthy();
  });

  test("it renders the expected icon for an individual html file", () => {
    const store = createMockStore({
      components: [{ name: "a", extension: "html" }],
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePanel.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("htmlIcon")).toBeTruthy();
  });

  test("it renders the expected icon for an individual css file", () => {
    const store = createMockStore({
      components: [{ name: "a", extension: "css" }],
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePanel.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("cssIcon")).toBeTruthy();
  });

  test("it renders the expected icon for an individual csv file", () => {
    const store = createMockStore({
      components: [{ name: "a", extension: "csv" }],
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePanel.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("csvIcon")).toBeTruthy();
  });

  test("it renders the expected icon for any other file type", () => {
    const store = createMockStore({
      components: [{ name: "a", extension: "docx" }],
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePanel.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("defaultFileIcon")).toBeTruthy();
  });
});

describe("When not read only", () => {
  beforeEach(() => {
    const store = createMockStore({
      components: [{ name: "a", extension: "py" }],
      readOnly: false,
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );
  });

  test("it renders the new file button", () => {
    expect(screen.queryByText("filePanel.newFileButton")).toBeInTheDocument();
  });

  test("it renders the file menu button", () => {
    expect(screen.queryByTitle("filePanel.fileMenu.label")).toBeInTheDocument();
  });
});

describe("When read only", () => {
  beforeEach(() => {
    const store = createMockStore({
      components: [{ name: "a", extension: "py" }],
      readOnly: true,
    });
    render(
      <Provider store={store}>
        <div id="app">
          <FilePanel />
        </div>
      </Provider>,
    );
  });

  test("it renders the new file button", () => {
    expect(
      screen.queryByText("filePanel.newFileButton"),
    ).not.toBeInTheDocument();
  });

  test("it does not render the file menu button", () => {
    expect(
      screen.queryByTitle("filePanel.fileMenu.label"),
    ).not.toBeInTheDocument();
  });
});
