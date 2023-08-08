import React from "react";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ projectType, isMobile }) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    }
    return PythonRunner;
  };

  const Selected = Runner();

  return <Selected isMobile={isMobile} />;
};

export default RunnerFactory;
