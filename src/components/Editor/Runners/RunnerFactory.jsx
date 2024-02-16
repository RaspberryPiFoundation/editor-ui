import React from "react";
import PyodideRunner from "./PyodideRunner/PyodideRunner";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ projectType, usePyodide }) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
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
