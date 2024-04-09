import { act, fireEvent, render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";

import PyodideRunner from "./PyodideRunner";
import { Provider } from "react-redux";
import PyodideWorker, { postMessage } from "./PyodideWorker.mock.js";
import { setError } from "../../../../redux/EditorSlice.js";

jest.mock("fs");

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {
  editor: {
    project: {
      components: [
        { name: "main", extension: "py", content: "print('hello')" },
      ],
      image_list: [
        { filename: "image1.jpg", url: "http://example.com/image1.jpg" },
      ],
    },
    codeRunTriggered: false,
  },
  auth: {},
};

describe("When first loaded", () => {
  beforeEach(() => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );
  });

  test("it renders successfully", () => {
    expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
  });
});

describe("When a code run has been triggered", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const fetchMock = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve("image data"),
    });

    global.fetch = fetchMock;

    const store = mockStore({
      ...initialState,
      editor: { ...initialState.editor, codeRunTriggered: true },
    });
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );
  });

  test("it writes the current files to the worker", () => {
    expect(postMessage).toHaveBeenCalledWith({
      method: "writeFile",
      filename: "main.py",
      content: "print('hello')",
    });
  });

  test("it writes the images to the worker", () => {
    expect(postMessage).toHaveBeenCalledWith({
      method: "writeFile",
      filename: "image1.jpg",
      content: "image data",
    });
  });

  test("it sends a message to the worker to run the python code", () => {
    expect(postMessage).toHaveBeenCalledWith({
      method: "runPython",
      python: "print('hello')",
    });
  });
});

describe("When the code has been stopped", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ...initialState,
      editor: { ...initialState.editor, codeRunStopped: true },
    });
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );
  });

  test("it sends a message to the worker to stop the python code", () => {
    expect(postMessage).toHaveBeenCalledWith({
      method: "stopPython",
    });
  });
});

describe("When loading pyodide", () => {
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({ method: "handleLoading" });
  });

  test("it dispatches loadingRunner action", () => {
    expect(store.getActions()).toEqual([{ type: "editor/loadingRunner" }]);
  });
});

describe("When pyodide has loaded", () => {
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({ method: "handleLoaded" });
  });

  test("it dispatches codeRunHandled action", () => {
    expect(store.getActions()).toEqual([{ type: "editor/codeRunHandled" }]);
  });
});

describe("When input is required", () => {
  let input;
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({ method: "handleInput" });
    input = document.getElementById("input");
  });

  test("it activates an input span", () => {
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

describe("When output is received", () => {
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({
      method: "handleOutput",
      stream: "stdout",
      content: "hello",
    });
  });

  test("it displays the output", () => {
    expect(screen.queryByText("hello")).toBeInTheDocument();
  });
});

describe("When visual output is received", () => {
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    act(() => {
      const worker = PyodideWorker.getLastInstance();
      worker.postMessageFromWorker({
        method: "handleVisual",
        origin: "pygal",
        content: { chart: { events: { load: () => {} } } },
      });
    });
  });

  test("it displays the output view toggle", async () => {
    expect(
      screen.queryByText("outputViewToggle.buttonSplitLabel"),
    ).toBeInTheDocument();
  });

  test("it shows the visual output tab", () => {
    const visualTab = screen.queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When an error is received", () => {
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({
      method: "handleError",
      line: 2,
      file: "main.py",
      type: "SyntaxError",
      info: "something's wrong",
    });
  });

  test("it dispatches action to set the error with correct message", () => {
    expect(store.getActions()).toEqual([
      {
        type: "editor/setError",
        payload: "SyntaxError: something's wrong on line 2 of main.py",
      },
    ]);
  });
});

describe("When the code run is interrupted", () => {
  let input;
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <PyodideRunner />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({ method: "handleInput" });
    input = document.getElementById("input");
    worker.postMessageFromWorker({
      method: "handleError",
      type: "KeyboardInterrupt",
    });
  });

  test("it disables the input span", () => {
    expect(input).not.toHaveAttribute("contentEditable", "true");
  });

  test("it sets an interruption error", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([setError("output.errors.interrupted")]),
    );
  });
});
