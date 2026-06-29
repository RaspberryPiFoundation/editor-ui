import { publicOriginPath } from "./runtimeConfig";

export const PYODIDE_WORKER_ARTIFACT = "PyodideWorker.js";

export const getPyodideWorkerScriptUrl = () =>
  publicOriginPath(PYODIDE_WORKER_ARTIFACT);

export const getPyodideWorkerBootstrap = (workerScriptUrl) => `
    /* global PyodideWorker */
    console.log("Worker loading");
    importScripts("${workerScriptUrl}");
    const pyodide = PyodideWorker();
    console.log("Worker loaded");
  `;

export const createPyodideWorkerUrl = (
  workerScriptUrl = getPyodideWorkerScriptUrl(),
) => {
  const blob = new Blob([getPyodideWorkerBootstrap(workerScriptUrl)], {
    type: "application/javascript",
  });
  return URL.createObjectURL(blob);
};
