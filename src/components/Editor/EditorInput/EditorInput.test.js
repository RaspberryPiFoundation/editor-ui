import React from "react";
import configureStore from "redux-mock-store";
import EditorInput from "./EditorInput";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import {
  closeFile,
  setFocussedFileIndex,
  setOpenFiles,
} from "../../../redux/EditorSlice";
import { matchMedia, setMedia } from "mock-match-media";
import { MOBILE_BREAKPOINT } from "../../../utils/mediaQueryBreakpoints";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

let mockMediaQuery = (query) => {
  return matchMedia(query).matches;
};

jest.mock("react-responsive", () => ({
  ...jest.requireActual("react-responsive"),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

describe("Tab interactions", () => {
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
              content: 'print("hello")',
            },
            {
              name: "a",
              extension: "py",
              content: "# Your code here",
            },
          ],
        },
        openFiles: [["main.py", "a.py"]],
        focussedFileIndices: [1],
        webComponent: false,
      },
      auth: {
        user: null,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <EditorInput />
        </div>
      </Provider>,
    );
  });

  test("Renders content of focussed file", () => {
    expect(screen.queryByText("# Your code here")).toBeInTheDocument();
  });

  test("Scrolls focussed file into view", () => {
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  test("Clicking the file close button dispatches close action", () => {
    const closeButton = screen.queryAllByRole("button")[2];
    fireEvent.click(closeButton);
    expect(store.getActions()).toEqual([closeFile("a.py")]);
  });

  test("Focusses tab when dragged", async () => {
    const tab = screen.queryByText("main.py").parentElement.parentElement;
    fireEvent.keyDown(tab, { key: " ", keyCode: 32, code: "Space" });
    await waitFor(() =>
      expect(store.getActions()).toEqual([
        setFocussedFileIndex({ panelIndex: 0, fileIndex: 0 }),
      ]),
    );
  });

  test("moves tab correctly when dropped", async () => {
    const tab = screen.queryByText("main.py").parentElement.parentElement;
    fireEvent.keyDown(tab, { key: " ", keyCode: 32, code: "Space" });
    fireEvent.keyDown(tab, {
      key: "ArrowRight",
      keyCode: 39,
      code: "ArrowRight",
    });
    fireEvent.keyDown(tab, { key: " ", keyCode: 32, code: "Space" });

    const moveTabAction = setOpenFiles([["a.py", "main.py"]]);
    await waitFor(() =>
      expect(store.getActions()).toEqual(
        expect.arrayContaining([moveTabAction]),
      ),
    );
  });

  test("focusses dropped tab", async () => {
    const tab = screen.queryByText("main.py").parentElement.parentElement;
    fireEvent.keyDown(tab, { key: " ", keyCode: 32, code: "Space" });
    fireEvent.keyDown(tab, {
      key: "ArrowRight",
      keyCode: 39,
      code: "ArrowRight",
    });
    fireEvent.keyDown(tab, { key: " ", keyCode: 32, code: "Space" });

    const switchFocusAction = setFocussedFileIndex({
      panelIndex: 0,
      fileIndex: 1,
    });
    await waitFor(() =>
      expect(store.getActions()).toEqual(
        expect.arrayContaining([switchFocusAction]),
      ),
    );
  });
});

describe("On mobile", () => {
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
          components: [
            {
              name: "main",
              extension: "py",
              content: 'print("hello")',
            },
            {
              name: "a",
              extension: "py",
              content: "# Your code here",
            },
          ],
        },
        openFiles: [["main.py", "a.py"]],
        focussedFileIndices: [1],
        webComponent: false,
      },
      auth: {
        user: null,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <EditorInput />
        </div>
      </Provider>,
    );
  });

  test("Run button to be in the tab bar", () => {
    const runButton =
      screen.getByText("runButton.run").parentElement.parentElement;
    const runButtonContainer = runButton.parentElement.parentElement;
    expect(runButtonContainer).toHaveClass("react-tabs__tab-container");
  });
});

describe("On desktop", () => {
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
          components: [
            {
              name: "main",
              extension: "py",
              content: 'print("hello")',
            },
            {
              name: "a",
              extension: "py",
              content: "# Your code here",
            },
          ],
        },
        openFiles: [["main.py", "a.py"]],
        focussedFileIndices: [1],
        webComponent: false,
      },
      auth: {
        user: null,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <EditorInput />
        </div>
      </Provider>,
    );
  });

  test("Run button to be in the run bar", () => {
    const runButton = screen.getByText("runButton.run").parentElement;
    const runButtonContainer = runButton.parentElement.parentElement;
    expect(runButtonContainer).toHaveClass("run-bar");
  });
});
