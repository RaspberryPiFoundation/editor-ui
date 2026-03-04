import React from "react";
import PythonRunner from "./PythonRunner/PythonRunner";
import RubyRunner from "./RubyRunner/RubyRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ projectType, outputPanels = ["text", "visual"] }) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    } else if (projectType === "ruby") {
      return RubyRunner;
    } else {
      return PythonRunner;
    }
  };

  const Selected = Runner();

  const props = projectType === "html" ? {} : { outputPanels };

  return <Selected {...props} />;
};

export default RunnerFactory;
