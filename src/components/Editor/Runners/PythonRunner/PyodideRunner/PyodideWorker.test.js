/* global globalThis, Atomics */

import { waitFor } from "@testing-library/react";
import { TextEncoder } from "util";
class MockPythonArray extends Array {
  toJs() {
    return this;
  }
}

// Mock global functions
global.postMessage = jest.fn();
global.importScripts = jest.fn();
global.TextEncoder = TextEncoder;
global.pygal = {};
global._internal_sense_hat = {};

const OUTPUT_LINE_LIMIT = 10_000;
const OUTPUT_CHARACTER_LIMIT = 250_000;

const getPostedMessages = (method) =>
  global.postMessage.mock.calls
    .map(([message]) => message)
    .filter((message) => message.method === method);

const getPostedOutput = () =>
  getPostedMessages("handleOutput")
    .flatMap(({ chunks }) => chunks)
    .map(({ content }) => content)
    .join("\n");

describe("PyodideWorker", () => {
  let worker;
  let pyodide;

  beforeEach(() => {
    jest.resetModules();
    pyodide = {
      _api: {
        pyodide_code: {
          find_imports: () => new MockPythonArray(),
        },
      },
      ffi: {
        PythonError: Error,
      },
      FS: {
        readdir: jest.fn().mockReturnValue([]),
        writeFile: jest.fn(),
      },
      loadPackage: jest.fn().mockReturnValue({ catch: jest.fn() }),
      loadPackagesFromImports: jest.fn(),
      micropip: {
        install: jest.fn().mockReturnValue({ catch: jest.fn() }),
      },
      checkInterrupt: jest.fn(),
      pyimport: jest.fn(),
      registerJsModule: jest.fn(),
      runPython: jest.fn(),
      runPythonAsync: jest.fn(),
      setInterruptBuffer: jest.fn(),
      setStdin: jest.fn(),
    };
    global.loadPyodide = jest.fn().mockResolvedValue(pyodide);
    require("../../../../../PyodideWorker.js");
    worker = globalThis.PyodideWorker();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it imports the pyodide script", () => {
    expect(global.importScripts).toHaveBeenCalledWith(
      "https://editor-assets.raspberrypi.org/pyodide/0.26.2/pyodide.js",
    );
  });

  test("it notifies component when pyodide is loading", () => {
    expect(global.postMessage).toHaveBeenCalledWith({
      method: "handleLoading",
    });
  });

  test("it loads pyodide", () => {
    expect(global.loadPyodide).toHaveBeenCalledWith(
      expect.objectContaining({
        indexURL: "https://editor-assets.raspberrypi.org/pyodide/0.26.2/",
      }),
    );
  });

  test("it notifies component when pyodide has loaded", () => {
    expect(global.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "handleLoaded",
      }),
    );
  });

  test("it writes a file", async () => {
    await worker.onmessage({
      data: {
        method: "writeFile",
        filename: "main.py",
        content: "print('hello')",
      },
    });
    const encoder = new TextEncoder();
    expect(pyodide.FS.writeFile).toHaveBeenCalledWith(
      "main.py",
      encoder.encode("print('hello')"),
    );
  });

  test("it patches the input function", async () => {
    expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
      expect.stringMatching(/__basthon\.kernel\.input_prompt\(str\(prompt\)\)/),
    );
  });

  test("it patches urllib and requests modules", async () => {
    expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
      expect.stringMatching(/pyodide_http.patch_all()/),
    );
  });

  test("it saves original open function", async () => {
    expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
      expect.stringMatching(/_original_open = builtins.open/),
    );
  });

  test("it tries to load package from file system", async () => {
    pyodide._api.pyodide_code.find_imports = () => new MockPythonArray("numpy");
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "import numpy",
      },
    });
    await waitFor(() =>
      expect(pyodide.FS.readdir).toHaveBeenCalledWith("/home/pyodide"),
    );
  });

  test("it checks if the package is built into python", async () => {
    pyodide._api.pyodide_code.find_imports = () => new MockPythonArray("numpy");
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "import numpy",
      },
    });
    await waitFor(() => expect(pyodide.pyimport).toHaveBeenCalledWith("numpy"));
  });

  test("it tries to load the package from pyodide", async () => {
    pyodide._api.pyodide_code.find_imports = () => new MockPythonArray("numpy");
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "import numpy",
      },
    });
    await waitFor(() =>
      expect(pyodide.loadPackage).toHaveBeenCalledWith("numpy"),
    );
  });

  test("it tries to load the package from PyPI", async () => {
    pyodide._api.pyodide_code.find_imports = () => new MockPythonArray("numpy");
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "import numpy",
      },
    });
    await waitFor(() =>
      expect(pyodide.micropip.install).toHaveBeenCalledWith("numpy"),
    );
  });

  test("it registers JS module for pygal", async () => {
    pyodide._api.pyodide_code.find_imports = () => new MockPythonArray("pygal");
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "import pygal",
      },
    });
    await waitFor(() => {
      expect(pyodide.registerJsModule).toHaveBeenCalledWith(
        "pygal",
        expect.any(Object),
      );
    });
  });

  test("it patches the open function", async () => {
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    await waitFor(() =>
      expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
        expect.stringMatching(/builtins.open = _custom_open/),
        { filename: "__custom_open__.py" },
      ),
    );
  });

  test("it runs the python code", async () => {
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    await waitFor(() => {
      expect(pyodide.runPython).toHaveBeenCalledWith("print('hello')");
    });
  });

  test("it sends fewer messages than lines produced in quick succession", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1000);
    const { stdout } = global.loadPyodide.mock.calls[0][0];
    pyodide.runPython.mockImplementation((python) => {
      if (python === "print lots") {
        stdout("0");
        stdout("1");
        stdout("2");
      }
    });
    global.postMessage.mockClear();

    worker.onmessage({
      data: {
        method: "runPython",
        python: "print lots",
      },
    });

    await waitFor(() =>
      expect(global.postMessage).toHaveBeenCalledWith({
        method: "handleRunComplete",
      }),
    );
    const outputMessages = getPostedMessages("handleOutput");

    expect(outputMessages.length).toBeGreaterThan(0);
    expect(outputMessages.length).toBeLessThan(3);
    expect(getPostedOutput()).toBe("0\n1\n2");
  });

  test("it limits the number of output lines sent to the UI", () => {
    jest.spyOn(Date, "now").mockReturnValue(1000);
    const { stdout } = global.loadPyodide.mock.calls[0][0];
    global.postMessage.mockClear();

    for (let i = 0; i <= OUTPUT_LINE_LIMIT; i += 1) {
      stdout(String(i));
    }

    expect(getPostedOutput().split("\n")).toHaveLength(OUTPUT_LINE_LIMIT);
    expect(getPostedMessages("handleOutputLimit")).toHaveLength(1);
  });

  test("it truncates a single output line at the character limit", () => {
    const { stdout } = global.loadPyodide.mock.calls[0][0];
    global.postMessage.mockClear();

    stdout("x".repeat(OUTPUT_CHARACTER_LIMIT + 1));
    stdout("not forwarded");

    const output = getPostedOutput();
    expect(`${output}\n`).toHaveLength(OUTPUT_CHARACTER_LIMIT);
    expect(output).not.toContain("not forwarded");
    expect(getPostedMessages("handleOutputLimit")).toHaveLength(1);
  });

  test("it resets an exhausted output limit when a run starts", async () => {
    const { stdout } = global.loadPyodide.mock.calls[0][0];
    stdout("x".repeat(OUTPUT_CHARACTER_LIMIT + 1));
    pyodide.runPython.mockImplementation((python) => {
      if (python === "next run") {
        stdout("visible again");
      }
    });
    global.postMessage.mockClear();

    worker.onmessage({
      data: {
        method: "runPython",
        python: "next run",
      },
    });

    await waitFor(() =>
      expect(global.postMessage).toHaveBeenCalledWith({
        method: "handleRunComplete",
      }),
    );
    expect(global.postMessage).toHaveBeenCalledWith({
      method: "handleOutput",
      chunks: [{ stream: "stdout", content: "visible again" }],
    });
  });

  test("it shows input prompts after the output limit is reached", () => {
    const { stdout } = global.loadPyodide.mock.calls[0][0];
    const basthon = pyodide.registerJsModule.mock.calls.find(
      ([name]) => name === "basthon",
    )[1];
    stdout("x".repeat(OUTPUT_CHARACTER_LIMIT + 1));
    global.postMessage.mockClear();

    basthon.kernel.input_prompt("What is your name?");

    expect(global.postMessage).toHaveBeenCalledWith({
      method: "handleOutput",
      chunks: [{ stream: "stdout", content: "What is your name?" }],
    });
  });

  test("it flushes buffered output before requesting input", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1);
    jest.spyOn(Atomics, "wait").mockReturnValue("not-equal");
    const { stdout } = global.loadPyodide.mock.calls[0][0];
    await waitFor(() => expect(pyodide.setStdin).toHaveBeenCalled());
    const { read } = pyodide.setStdin.mock.calls[0][0];
    global.postMessage.mockClear();

    stdout("before");
    stdout("prompt");
    read(new Uint8Array(1));

    const messages = global.postMessage.mock.calls.map(([message]) => message);
    expect(messages.slice(0, 2)).toEqual([
      {
        method: "handleOutput",
        chunks: [{ stream: "stdout", content: "before\nprompt" }],
      },
      { method: "handleInput" },
    ]);
  });

  test("it clears the pyodide variables after running the code", async () => {
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    await waitFor(() =>
      expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
        expect.stringContaining("del globals()[_var_name]"),
      ),
    );
  });

  test("it handles stopping by notifying component of an error", async () => {
    worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    await worker.onmessage({
      data: {
        method: "stopPython",
      },
    });
    await waitFor(() =>
      expect(global.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "handleError",
        }),
      ),
    );
  });
});
