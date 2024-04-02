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
      runPythonAsync: jest.fn(),
      setStdin: jest.fn(),
      setInterruptBuffer: jest.fn(),
      FS: {
        readdir: jest.fn().mockReturnValue([]),
        writeFile: jest.fn(),
      },
      ffi: {
        PythonError: jest.fn(),
      },
      _api: {
        pyodide_code: {
          find_imports: () => new MockPythonArray("numpy"),
        },
      },
      loadPackage: jest.fn().mockReturnValue({ catch: jest.fn() }),
      loadPackagesFromImports: jest.fn(),
      runPython: jest.fn(),
      pyimport: jest.fn(),
      micropip: {
        install: jest.fn().mockReturnValue({ catch: jest.fn() }),
      },
    };
    global.loadPyodide = jest.fn().mockResolvedValue(pyodide);
    worker = require("./PyodideWorker.js", { type: "module" });
  });

  test("it imports the pyodide script", () => {
    expect(global.importScripts).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js",
    );
  });

  test("it loads pyodide", () => {
    expect(global.loadPyodide).toHaveBeenCalled();
  });

  test("it writes a file", async () => {
    worker = require("./PyodideWorker.js", { type: "module" });
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

  // // workerPlugin.js - simple test case
  // test("worker responds correctly to message", async () => {
  //   const worker = require("./workerPlugin.js");

  //   const result = await worker.processMessage(5);

  //   expect(result).toBe(10);
  // });

  // // Pyodide.worker.js
  // test("PyodideWorker responds correctly to message", async () => {
  //   // Create a new worker instance
  //   const worker = require("./PyodideWorker.js", { type: "module" });

  //   // Listen for messages from the worker
  //   const result = await worker.processMessage(5);

  //   // Send a message to the worker
  //   expect(result).toBe(10);
  // }, 5000);

  // test("global loadPyodide is called", async () => {
  //   const pyodide = await global.loadPyodide();
  //   expect(global.loadPyodide).toHaveBeenCalled();
  // });

  // test("pyodide is mocked correctly", async () => {
  //   const pyodide = await global.loadPyodide();
  //   console.log(pyodide);
  //   await waitFor(() => {
  //     expect(pyodide).not.toBe(undefined);
  //   });
  //   await waitFor(() =>
  //     expect(pyodide.runPythonAsync()).resolves.toBe("mocked value"),
  //   );
  // });
});
