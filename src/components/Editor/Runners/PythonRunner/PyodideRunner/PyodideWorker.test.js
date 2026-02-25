/* global globalThis */

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

  test("it imports the pyodide script", () => {
    expect(global.importScripts).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js",
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
    const encoder = new TextEncoder();
    expect(pyodide.FS.writeFile).toHaveBeenCalledWith(
      "main.py",
      encoder.encode("print('hello')"),
    );
  });

  test("it patches the input function", async () => {
    expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
      expect.stringMatching(/__builtins__.input = __patched_input__/),
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

  test("it clears the pyodide variables after running the code", async () => {
    await worker.onmessage({
      data: {
        method: "runPython",
        python: "print('hello')",
      },
    });
    await waitFor(() =>
      expect(pyodide.runPythonAsync).toHaveBeenCalledWith(
        expect.stringContaining("del globals()[name]"),
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
