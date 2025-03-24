import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import PyodideRunner from "./PyodideRunner";
import { Provider } from "react-redux";
import PyodideWorker, { postMessage } from "./PyodideWorker.mock.js";

import {
  resetState,
  setError,
  triggerCodeRun,
  setProject,
  setLoadedRunner,
  stopCodeRun,
  setSenseHatAlwaysEnabled,
  openFile,
  setFocussedFileIndex,
} from "../../../../../redux/EditorSlice.js";
import store from "../../../../../app/store";

jest.mock("fs");
global.fetch = jest.fn();

const project = {
  components: [
    { name: "a", extension: "py", content: "print('a')" },
    { name: "main", extension: "py", content: "print('hello')" },
    { name: "existing_file", extension: "txt", content: "hello" },
  ],
  image_list: [
    { filename: "image1.jpg", url: "http://example.com/image1.jpg" },
  ],
};

window.crossOriginIsolated = true;
process.env.PUBLIC_URL = ".";

const updateRunner = ({ project = {}, codeRunTriggered = false }) => {
  act(() => {
    if (project) {
      store.dispatch(setProject(project));
    }
    if (codeRunTriggered) {
      store.dispatch(triggerCodeRun());
    }
  });
};

let dispatchSpy;

beforeEach(() => {
  store.dispatch(resetState());
  window.crossOriginIsolated = true;
  dispatchSpy = jest.spyOn(store, "dispatch");
  fetch.mockClear();
});

afterEach(() => {
  dispatchSpy.mockRestore();
});

describe("When active and first loaded", () => {
  beforeEach(() => {
    window.crossOriginIsolated = true;
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );
  });

  test("it renders successfully", () => {
    expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
  });

  test("it does have active styles", () => {
    const element = document.querySelector(".pyodiderunner");
    expect(element).toHaveClass("pyodiderunner--active");
  });
});

describe("When a code run has been triggered", () => {
  beforeEach(() => {
    window.crossOriginIsolated = true;
    global.fetch.mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );
    updateRunner({ project, codeRunTriggered: true });
  });

  test("it writes the current files to the worker", async () => {
    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith({
        method: "writeFile",
        filename: "a.py",
        content: "print('a')",
      });
      expect(postMessage).toHaveBeenCalledWith({
        method: "writeFile",
        filename: "main.py",
        content: "print('hello')",
      });
    });
  });

  test("it writes the images to the worker", async () => {
    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith({
        method: "writeFile",
        filename: "image1.jpg",
        content: expect.any(ArrayBuffer),
      });
    });
  });

  test("it sends a message to the worker to run the python code", async () => {
    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith({
        method: "runPython",
        python: "print('hello')",
      });
    });
  });
});

describe("When the code has been stopped", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );
    store.dispatch(stopCodeRun());
  });

  test("it sends a message to the worker to stop the python code", async () => {
    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith({
        method: "stopPython",
      });
    });
  });
});

describe("When loading pyodide", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({ method: "handleLoaded" });
  });

  test("it dispatches loadingRunner action", () => {
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/setLoadedRunner",
      payload: "pyodide",
    });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/codeRunHandled",
    });
  });
});

describe("When pyodide has loaded", () => {
  beforeEach(() => {
    store.dispatch(setLoadedRunner("pyodide"));
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({ method: "handleLoaded" });
  });

  test("it dispatches codeRunHandled action", () => {
    expect(dispatchSpy).toHaveBeenCalledWith({ type: "editor/codeRunHandled" });
  });
});

describe("When input is required", () => {
  let input;
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
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
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessage = jest.fn();
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

describe("When file write event is received", () => {
  let worker;
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
      </Provider>,
    );
    updateRunner({ project });
    worker = PyodideWorker.getLastInstance();
  });

  test("it overwrites existing files in 'w' mode", () => {
    worker.postMessageFromWorker({
      method: "handleFileWrite",
      filename: "existing_file.txt",
      content: "new content",
      mode: "w",
    });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/updateProjectComponent",
      payload: {
        name: "existing_file",
        extension: "txt",
        content: "new content",
        cascadeUpdate: false,
      },
    });
  });

  test("it creates new file if not already existing in 'w' mode", () => {
    worker.postMessageFromWorker({
      method: "handleFileWrite",
      filename: "new_file.txt",
      content: "new content",
      mode: "w",
    });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/addProjectComponent",
      payload: {
        name: "new_file",
        extension: "txt",
        content: "new content",
      },
    });
  });

  test("it appends to existing files in 'a' mode", () => {
    worker.postMessageFromWorker({
      method: "handleFileWrite",
      filename: "existing_file.txt",
      content: "\nnew content",
      mode: "a",
    });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/updateProjectComponent",
      payload: {
        name: "existing_file",
        extension: "txt",
        content: "hello\nnew content",
        cascadeUpdate: false,
      },
    });
  });

  test("it creates new file if not already existing in 'a' mode", () => {
    worker.postMessageFromWorker({
      method: "handleFileWrite",
      filename: "new_file.txt",
      content: "new content",
      mode: "a",
    });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/addProjectComponent",
      payload: {
        name: "new_file",
        extension: "txt",
        content: "new content",
      },
    });
  });

  test("it creates new file if not already existing in 'x' mode", () => {
    worker.postMessageFromWorker({
      method: "handleFileWrite",
      filename: "new_file.txt",
      content: "new content",
      mode: "x",
    });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/addProjectComponent",
      payload: {
        name: "new_file",
        extension: "txt",
        content: "new content",
      },
    });
  });

  test("it cascades updates if the file is open and focused", () => {
    store.dispatch(openFile({ name: "existing_file", extension: "txt" }));
    store.dispatch(setFocussedFileIndex({ panelIndex: 0, fileIndex: 1 }));

    worker.postMessageFromWorker({
      method: "handleFileWrite",
      filename: "existing_file.txt",
      content: "\nnew content",
      mode: "a",
    });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/updateProjectComponent",
      payload: {
        name: "existing_file",
        extension: "txt",
        content: "hello\nnew content",
        cascadeUpdate: false,
      },
    });
  });
});

describe("When visual output is received", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
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
    await waitFor(() => {
      expect(
        screen.queryByText("outputViewToggle.buttonTabLabel"),
      ).toBeInTheDocument();
    });
  });

  test("it shows the visual output tab", () => {
    const visualTab = screen.queryByText("output.visualOutput");
    expect(visualTab).toBeInTheDocument();
  });
});

describe("When an error is received", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
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
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "editor/setError",
      payload: "SyntaxError: something's wrong on line 2 of main.py",
    });
  });
});

describe("When the code run is interrupted", () => {
  let input;

  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={true} />,
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
    expect(dispatchSpy).toHaveBeenCalledWith(
      setError("output.errors.interrupted"),
    );
  });
});

describe("When not active and first loaded", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={false} />,
      </Provider>,
    );
  });

  test("it does not have active styles", () => {
    const element = document.querySelector(".pyodiderunner");
    expect(element).not.toHaveClass("pyodiderunner--active");
  });
});

describe("When not active and code run triggered", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <PyodideRunner active={false} />,
      </Provider>,
    );
    updateRunner({ project, codeRunTriggered: true });
  });

  test("it does not send a message to the worker to run the python code", () => {
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe("When there is visual output", () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(setSenseHatAlwaysEnabled(true));
    });
  });

  test("displays both text and visual tabs by default", () => {
    render(
      <Provider store={store}>
        <PyodideRunner />
      </Provider>,
    );
    expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
    expect(screen.queryByText("output.visualOutput")).toBeInTheDocument();
  });

  test("only displays text tab when outputPanels is set to just text", () => {
    render(
      <Provider store={store}>
        <PyodideRunner outputPanels={["text"]} />
      </Provider>,
    );
    expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
    expect(screen.queryByText("output.visualOutput")).not.toBeInTheDocument();
  });

  test("only displays visual tab when outputPanels is set to just visual", () => {
    render(
      <Provider store={store}>
        <PyodideRunner outputPanels={["visual"]} />
      </Provider>,
    );
    expect(screen.queryByText("output.textOutput")).not.toBeInTheDocument();
    expect(screen.queryByText("output.visualOutput")).toBeInTheDocument();
  });

  afterEach(() => {
    store.dispatch(setSenseHatAlwaysEnabled(false));
  });
});
