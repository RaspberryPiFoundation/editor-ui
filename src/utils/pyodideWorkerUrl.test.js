import {
  createPyodideWorkerUrl,
  getPyodideWorkerBootstrap,
  getPyodideWorkerScriptUrl,
} from "./pyodideWorkerUrl";

describe("pyodideWorkerUrl", () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  const originalBlob = global.Blob;
  const originalCreateObjectUrl = URL.createObjectURL;

  afterEach(() => {
    process.env.PUBLIC_URL = originalPublicUrl;
    global.Blob = originalBlob;
    URL.createObjectURL = originalCreateObjectUrl;
  });

  it("keeps the stable worker artifact path under PUBLIC_URL", () => {
    process.env.PUBLIC_URL = ".";

    expect(getPyodideWorkerScriptUrl()).toBe("./PyodideWorker.js");
  });

  it("creates the worker bootstrap that imports the emitted artifact", () => {
    expect(getPyodideWorkerBootstrap("/PyodideWorker.js")).toContain(
      'importScripts("/PyodideWorker.js");',
    );
  });

  it("wraps the bootstrap in a JavaScript blob URL", () => {
    const blob = {};
    global.Blob = jest.fn(() => blob);
    URL.createObjectURL = jest.fn(() => "blob:pyodide-worker");

    expect(createPyodideWorkerUrl("/PyodideWorker.js")).toBe(
      "blob:pyodide-worker",
    );
    expect(global.Blob).toHaveBeenCalledWith(
      [expect.stringContaining('importScripts("/PyodideWorker.js");')],
      { type: "application/javascript" },
    );
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });
});
