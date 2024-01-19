import { useMemo } from "react";

const PyodideRunner = () => {
  const worker = useMemo(loadPyodideWorker, []);

  worker.onmessage = ({ data }) => {
    console.log(data);
  };

  return <p>Hello, World!</p>;
};

const loadPyodideWorker = () =>
  new Worker("/webworkers/pyodideWorker.js", { type: "module" });

export default PyodideRunner;
