import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import FilePanel from "./FilePanel";
import { openFile, setFocussedFileIndex } from "../../../../redux/EditorSlice";

const mockStore = configureMockStore();
let store;

beforeEach(() => {
  store = mockStore({
    editor: {
      project: {
        components: [
          { name: "main", extension: "py" },
          { name: "index", extension: "html" },
          { name: "style", extension: "css" },
        ],
      },
      openFiles: [["main.py", "index.html"]],
    },
  });

  render(
    <Provider store={store}>
      <FilePanel isMobile={false} />
    </Provider>,
  );
});

describe("FilePanel", () => {
  test("renders without crashing", () => {
    // Test will pass if render in beforeEach doesn't throw an error
  });

  test("renders the correct files", () => {
    expect(screen.getByText("main.py")).toBeInTheDocument();
    expect(screen.getByText("index.html")).toBeInTheDocument();
    expect(screen.getByText("style.css")).toBeInTheDocument();
  });

  test("dispatches openFile and setFocussedFileIndex with correct value when a file is clicked", () => {
    const fileButton = screen.getByText("style.css");
    fireEvent.click(fileButton);

    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        openFile("style.css"),
        setFocussedFileIndex({ panelIndex: 0, fileIndex: 2 }),
      ]),
    );
  });

  test("dispatches setFocussedFileIndex with correct value when an already open file is clicked", () => {
    const fileButton = screen.getByText("main.py");
    fireEvent.click(fileButton);

    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        setFocussedFileIndex({ panelIndex: 0, fileIndex: 0 }),
      ]),
    );
  });

  test("renders the correct icon for python file", () => {
    const pythonFileIcon = screen
      .getByText("main.py")
      .parentElement.querySelector("svg");

    expect(pythonFileIcon).toBeInTheDocument();
    expect(pythonFileIcon).toHaveAttribute("data-testid", "pythonIcon");
  });

  test("renders the correct icon for html file", () => {
    const htmlFileIcon = screen
      .getByText("index.html")
      .parentElement.querySelector("svg");

    expect(htmlFileIcon).toBeInTheDocument();
    expect(htmlFileIcon).toHaveAttribute("data-testid", "htmlIcon");
  });

  test("renders the correct icon for css file", () => {
    const cssFileIcon = screen
      .getByText("style.css")
      .parentElement.querySelector("svg");

    expect(cssFileIcon).toBeInTheDocument();
    expect(cssFileIcon).toHaveAttribute("data-testid", "cssIcon");
  });
});
