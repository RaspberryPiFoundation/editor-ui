import React, { useEffect, useState } from "react";

import PyodideRunner from "../PyodideRunner/PyodideRunner";
import SkulptRunner from "./SkulptRunner";
import { useSelector } from "react-redux";

const SKULPT_ONLY_MODULES = ["p5", "py5", "sense_hat"];

const PythonRunner = () => {
  const project = useSelector((state) => state.editor.project);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const [usePyodide, setUsePyodide] = useState(false);

  const getImports = (code) => {
    const importRegex =
      /^(from\s+([a-zA-Z0-9_.]+)(\s+import\s+([a-zA-Z0-9_.]+))?)|^(import\s+([a-zA-Z0-9_.]+))/gm;
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
    project.components.forEach((component) => {
      if (component.extension === "py" && !codeRunTriggered) {
        try {
          const imports = getImports(component.content);
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
        } catch (error) {
          console.error("Error occurred while getting imports:", error);
        }
      }
    });
  }, [project, codeRunTriggered]);
  return (
    <>
      <PyodideRunner active={usePyodide} />
      <SkulptRunner active={!usePyodide} />
      {/* {usePyodide ? <PyodideRunner /> : <SkulptRunner />} */}
    </>
  );
};

export default PythonRunner;
