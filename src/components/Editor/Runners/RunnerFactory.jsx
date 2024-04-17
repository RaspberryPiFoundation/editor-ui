import React from "react";
import PyodideRunner from "./PyodideRunner/PyodideRunner";
import PythonRunner from "./PythonRunner/PythonRunner";
import MicroPythonRunner from "./MicroPythonRunner/MicroPythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ isPico, projectType, usePyodide }) => {
  console.log("RUNNERFACTORY");
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    } else if (isPico) {
      return MicroPythonRunner;
    } else if (usePyodide) {
      return PyodideRunner;
    } else {
      return PythonRunner;
    }
  };

  const Selected = Runner();

  return <Selected />;
};

export default RunnerFactory;
