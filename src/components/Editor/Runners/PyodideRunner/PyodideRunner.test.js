import { render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";

import PyodideRunner from "./PyodideRunner";
import { Provider } from "react-redux";
import { postMessage } from "./PyodideWorker.mock.js";

jest.mock("fs");

beforeEach(() => {
  jest.clearAllMocks();
});

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
    const fetchMock = jest.fn().mockResolvedValue({
      arrayBuffer: () => {
        console.log("fetchMock called");
        return Promise.resolve("image data");
      },
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
  beforeEach(() => {
    const store = mockStore({
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
