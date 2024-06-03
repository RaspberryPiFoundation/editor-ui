import React from "react";
import PyodideRunner from "./PyodideRunner/PyodideRunner";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({
  projectType,
  usePyodide,
  outputPanels = ["text", "visual"],
}) => {
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

  const props = projectType === "html" ? {} : { outputPanels };

  return <Selected {...props} />;
};

export default RunnerFactory;
