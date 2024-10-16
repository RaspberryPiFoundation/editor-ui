import React from "react";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({
  autoRun,
  projectType,
  outputPanels = ["text", "visual"],
}) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    } else {
      return PythonRunner;
    }
  };

  const Selected = Runner();

  const props = projectType === "html" ? {} : { outputPanels, autoRun };

  return <Selected {...props} />;
};

export default RunnerFactory;
