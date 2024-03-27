// Mock global functions
global.postMessage = jest.fn();
global.importScripts = jest.fn();
global.loadPyodide = jest.fn();

describe("PyodideWorker", () => {
  // workerPlugin.js - simple test case
  test("worker responds correctly to message", async () => {
    const worker = require("./workerPlugin.js");

    const result = await worker.processMessage(5);

    expect(result).toBe(10);
  });

  // Pyodide.worker.js
  test("PyodideWorker responds correctly to message", async () => {
    // Create a new worker instance
    const worker = require("./PyodideWorker.js", { type: "module" });

    // Listen for messages from the worker
    const result = await worker.processMessage(5);

    // Send a message to the worker
    expect(result).toBe(10);
  }, 5000);

  test("PyodideWorker responds to onmessage", async () => {
    // Create a new worker instance
    const worker = require("./PyodideWorker.js", { type: "module" });

    // Listen for messages from the worker
    const result = await worker.onmessage({
      data: {
        method: "runPython",
        python: "print(5 + 5)",
      },
    });

    // Send a message to the worker
    expect(result).toBe(10);
  }, 5000);
});
