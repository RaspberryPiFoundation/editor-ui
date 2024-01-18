const PyodideRunner = () => {
  const worker = new Worker("/webworkers/pyodideWorker.js", { type: "module" });

  return <p>Hello, World!</p>;
};

export default PyodideRunner;
