import React, { useEffect, useState } from "react";

import PyodideRunner from "../PyodideRunner/PyodideRunner";
import SkulptRunner from "./SkulptRunner/SkulptRunner";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const SKULPT_ONLY_MODULES = ["p5", "py5", "py5_imported", "sense_hat"];

const PythonRunner = () => {
  const project = useSelector((state) => state.editor.project);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const [usePyodide, setUsePyodide] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    console.log("usePyodide", usePyodide);
  }, [usePyodide]);

  useEffect(() => {
    const getImports = (code) => {
      const codeWithoutMultilineStrings = code.replace(
        /'''[\s\S]*?'''|"""[\s\S]*?"""/gm,
        "",
      );
      const importRegex =
        /(?<=^\s*)(from\s+([a-zA-Z0-9_.]+)(\s+import\s+([a-zA-Z0-9_.]+))?)|(?<=^\s*)(import\s+([a-zA-Z0-9_.]+))/gm;
      const matches = codeWithoutMultilineStrings.match(importRegex);
      console.log(matches);
      const imports = matches
        ? matches.map(
            (match) =>
              match
                .split(/from|import/)
                .filter(Boolean)
                .map((s) => s.trim())[0],
          )
        : [];
      if (code.includes(`# ${t("input.comment.py5")}`)) {
        imports.push("py5_imported");
      }
      return imports;
    };

    project.components.forEach((component) => {
      if (component.extension === "py" && !codeRunTriggered) {
        try {
          const imports = getImports(component.content);
          const hasSkulptOnlyModules = imports.some((name) =>
            SKULPT_ONLY_MODULES.includes(name),
          );
          if (hasSkulptOnlyModules) {
            setUsePyodide(false);
          } else {
            setUsePyodide(true);
          }
        } catch (error) {
          console.error("Error occurred while getting imports:", error);
        }
      }
    });
  }, [project, codeRunTriggered, t]);
  return (
    <>
      <PyodideRunner active={usePyodide} />
      <SkulptRunner active={!usePyodide} />
    </>
  );
};

export default PythonRunner;
