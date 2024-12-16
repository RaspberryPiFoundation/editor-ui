import React from "react";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({
  autoRun = false,
  projectType,
  outputPanels = ["text", "visual"],
  showOutputTabs = true,
}) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    } else {
      return PythonRunner;
    }
  };

  const Selected = Runner();

  const props =
    projectType === "html" ? {} : { outputPanels, autoRun, showOutputTabs };

  return <Selected {...props} />;
};

export default RunnerFactory;
