/* eslint import/no-webpack-loader-syntax: off */

import { useMemo } from "react";
import PyodideWorker from "worker-loader!./PyodideWorker.js";

const PyodideRunner = () => {
  const worker = useMemo(() => new PyodideWorker(), []);

  worker.onmessage = ({ data }) => {
    console.log(data);
  };

  return <p>Hello, World!</p>;
};

export default PyodideRunner;
