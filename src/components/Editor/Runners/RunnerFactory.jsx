import React from "react";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ projectType }) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    } else {
      return PythonRunner;
    }
  };

  const Selected = Runner();

  return <Selected />;
};

export default RunnerFactory;
