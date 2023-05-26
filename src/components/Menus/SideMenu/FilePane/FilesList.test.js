import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import FilesList from "./FilesList";

const openFileTab = jest.fn();

const createMockStore = function (components) {
  const mockStore = configureStore([]);
  return mockStore({
    editor: {
      project: {
        components: components,
      },
      isEmbedded: false,
    },
    auth: {
      user: null,
    },
  });
};

describe("When project has multiple files", () => {
  beforeEach(() => {
    const store = createMockStore([
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
    ]);
    render(
      <Provider store={store}>
        <div id="app">
          <FilesList openFileTab={openFileTab} />
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
    expect(screen.getAllByTitle("filePane.fileMenu.label").length).toBe(4);
  });

  test("Clicking file name opens file tab", () => {
    fireEvent.click(screen.queryByText("a.py").parentElement);
    expect(openFileTab).toHaveBeenCalledWith("a.py");
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
    const store = createMockStore([{ name: "a", extension: "py" }]);
    render(
      <Provider store={store}>
        <div id="app">
          <FilesList openFileTab={openFileTab} />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePane.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("pythonIcon")).toBeTruthy();
  });

  test("it renders the expected icon for an individual html file", () => {
    const store = createMockStore([{ name: "a", extension: "html" }]);
    render(
      <Provider store={store}>
        <div id="app">
          <FilesList openFileTab={openFileTab} />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePane.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("htmlIcon")).toBeTruthy();
  });

  test("it renders the expected icon for an individual css file", () => {
    const store = createMockStore([{ name: "a", extension: "css" }]);
    render(
      <Provider store={store}>
        <div id="app">
          <FilesList openFileTab={openFileTab} />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePane.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("cssIcon")).toBeTruthy();
  });

  test("it renders the expected icon for an individual csv file", () => {
    const store = createMockStore([{ name: "a", extension: "csv" }]);
    render(
      <Provider store={store}>
        <div id="app">
          <FilesList openFileTab={openFileTab} />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePane.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("csvIcon")).toBeTruthy();
  });

  test("it renders the expected icon for any other file type", () => {
    const store = createMockStore([{ name: "a", extension: "docx" }]);
    render(
      <Provider store={store}>
        <div id="app">
          <FilesList openFileTab={openFileTab} />
        </div>
      </Provider>,
    );

    expect(screen.getAllByTitle("filePane.fileMenu.label").length).toBe(1);
    expect(screen.getByTestId("defaultFileIcon")).toBeTruthy();
  });
});
