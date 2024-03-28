import { waitFor } from "@testing-library/react";

class MockPythonArray extends Array {
  toJs() {
    return this;
  }
}
// Mock global functions
const pyodide = {
  runPythonAsync: jest.fn(),
  setStdin: jest.fn(),
  setInterruptBuffer: jest.fn(),
  FS: {
    readdir: (name) => [],
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
  loadPackage: () => ({ catch: jest.fn() }),
  loadPackagesFromImports: jest.fn(),
  runPython: jest.fn(),
  pyimport: jest.fn(),
  micropip: {
    install: () => ({ catch: jest.fn() }),
  },
};
global.postMessage = jest.fn();
global.importScripts = jest.fn();

describe("PyodideWorker", () => {
  let worker;

  beforeEach(() => {
    jest.resetModules();
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
