import { waitFor } from "@testing-library/react";

class MockPythonArray extends Array {
  toJs() {
    return this;
  }
}

// Mock global functions
global.postMessage = jest.fn();
global.importScripts = jest.fn();

describe("PyodideWorker", () => {
  let worker;
  let pyodide;

  beforeEach(() => {
    jest.resetModules();
    pyodide = {
      _api: {
        pyodide_code: {
          find_imports: () => new MockPythonArray("numpy", "pygal"),
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
      pyimport: jest.fn(),
      registerJsModule: jest.fn(),
      runPython: jest.fn(),
      runPythonAsync: jest.fn(),
      setInterruptBuffer: jest.fn(),
      setStdin: jest.fn(),
    };
    global.loadPyodide = jest.fn().mockResolvedValue(pyodide);
    worker = require("./PyodideWorker.test.mock.js", { type: "module" });
  });

  test("it imports the pyodide script", () => {
    expect(global.importScripts).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js",
    );
  });

  test("it notifies component when pyodide is loading", () => {
    expect(global.postMessage).toHaveBeenCalledWith({
      method: "handleLoading",
    });
  });

  test("it loads pyodide", () => {
    expect(global.loadPyodide).toHaveBeenCalled();
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
    expect(pyodide.FS.writeFile).toHaveBeenCalledWith(
      "main.py",
      new Buffer("print('hello')"),
    );
  });

  test("it patches the input function", async () => {
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
      expect.stringMatching(/__builtins__.input = patched_input/),
    );
  });

  test("it tries to load package from file system", async () => {
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
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "import numpy",
      },
    });
    await waitFor(() => expect(pyodide.pyimport).toHaveBeenCalledWith("numpy"));
  });

  test("it tries to load the package from pyodide", async () => {
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

  test("it reloads pyodide after running the code", async () => {
    global.loadPyodide.mockClear();
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    await waitFor(() => {
      expect(global.loadPyodide).toHaveBeenCalled();
    });
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
