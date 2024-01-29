import React from "react";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ projectType, outputPanels = ["text", "visual"] }) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    }
    return PythonRunner;
  };

  const Selected = Runner();

  const props = projectType === "python" ? { outputPanels } : {};

  return <Selected {...props} />;
};

export default RunnerFactory;
