import React from "react";
import PyodideRunner from "./PythonRunner/PyodideRunner/PyodideRunner";
// import PythonRunner from "./PythonRunner/SkulptRunner/SkulptRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";

const RunnerFactory = ({ projectType }) => {
  const Runner = () => {
    if (projectType === "html") {
      return HtmlRunner;
    } else {
      return PyodideRunner;
    }
  };

  const Selected = Runner();

  return <Selected />;
};

export default RunnerFactory;
