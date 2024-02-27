import React, { useEffect, useState } from "react";
import PyodideRunner from "./PyodideRunner/PyodideRunner";
import PythonRunner from "./PythonRunner/PythonRunner";
import HtmlRunner from "./HtmlRunner/HtmlRunner";
import { useSelector } from "react-redux";
// import { parse } from "filbert";

const SKULPT_ONLY_MODULES = ["p5", "py5", "sense_hat"];

const RunnerFactory = ({ projectType }) => {
  const Runner = () => {
    const project = useSelector((state) => state.editor.project);
    const [usePyodide, setUsePyodide] = useState(false);

    // useEffect(() => {
    //   project.components.forEach((component) => {
    //     if (component.type === "python") {
    //       // const ast = parse(component.code);
    //       const imports = ast.body.filter((node) => node.type === "Import");
    //       const importNames = imports.map((node) => node.names[0].name);
    //       const hasSkulptOnlyModules = importNames.some((name) =>
    //         SKULPT_ONLY_MODULES.includes(name),
    //       );
    //       if (hasSkulptOnlyModules) {
    //         setUsePyodide(false);
    //       }
    //     }
    //   });
    // }, [project]);

    const getImports = (code) => {
      const importRegex =
        /(from\s+([a-zA-Z0-9_\.]+)(\s+import\s+([a-zA-Z0-9_\.]+))?)|(import\s+([a-zA-Z0-9_\.]+))/g;
      const matches = code.match(importRegex);
      const imports = matches
        ? matches.map(
            (match) =>
              match
                .split(/from|import/)
                .filter(Boolean)
                .map((s) => s.trim())[0],
          )
        : [];
      return imports;
    };

    useEffect(() => {
      console.log("scanning imports");
      project.components.forEach((component) => {
        if (projectType === "python" && component.extension === "py") {
          const imports = getImports(component.content);
          console.log(imports);
          // const importNames = imports.map((importArr) => importArr[1]);
          const hasSkulptOnlyModules = imports.some((name) =>
            SKULPT_ONLY_MODULES.includes(name),
          );
          if (hasSkulptOnlyModules) {
            console.log("using skulpt");
            setUsePyodide(false);
          } else {
            console.log("using pyodide");
            setUsePyodide(true);
          }
        }
      });
    }, [project]);

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
