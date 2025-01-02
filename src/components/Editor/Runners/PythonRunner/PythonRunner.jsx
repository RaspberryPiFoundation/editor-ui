import React, { useEffect, useState } from "react";

import PyodideRunner from "./PyodideRunner/PyodideRunner";
import SkulptRunner from "./SkulptRunner/SkulptRunner";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { loadingRunner } from "../../../../redux/EditorSlice";

const SKULPT_ONLY_MODULES = [
  "p5",
  "py5",
  "py5_imported",
  "sense_hat",
  "turtle",
];

const PythonRunner = ({ outputPanels = ["text", "visual"] }) => {
  const dispatch = useDispatch();

  const project = useSelector((state) => state.editor.project);
  const activeRunner = useSelector((state) => state.editor.activeRunner);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const senseHatAlwaysEnabled = useSelector(
    (state) => state.editor.senseHatAlwaysEnabled,
  );
  const [usePyodide, setUsePyodide] = useState(null);
  const [skulptFallback, setSkulptFallback] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof usePyodide === "boolean") {
      const runner = usePyodide ? "pyodide" : "skulpt";
      if (runner !== activeRunner) {
        dispatch(loadingRunner(runner));
      }
    }
  }, [dispatch, usePyodide, activeRunner]);

  useEffect(() => {
    if (!!!window?.crossOriginIsolated) {
      setUsePyodide(false);
      setSkulptFallback(true);
      return;
    }
    const getImports = (code) => {
      const codeWithoutMultilineStrings = code.replace(
        /'''[\s\S]*?'''|"""[\s\S]*?"""/gm,
        "",
      );
      const importRegex =
        /(?<=^\s*)(from\s+([a-zA-Z0-9_.]+)(\s+import\s+([a-zA-Z0-9_.]+))?)|(?<=^\s*)(import\s+([a-zA-Z0-9_.]+))/gm;
      const matches = codeWithoutMultilineStrings.match(importRegex);
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

    for (const component of project.components || []) {
      if (component.extension === "py" && !codeRunTriggered) {
        try {
          const imports = getImports(component.content);
          const hasSkulptOnlyModules = imports.some((name) =>
            SKULPT_ONLY_MODULES.includes(name),
          );
          if (
            !skulptFallback &&
            (hasSkulptOnlyModules || senseHatAlwaysEnabled)
          ) {
            setUsePyodide(false);
            break;
          } else {
            setUsePyodide(true);
          }
        } catch (error) {
          console.error("Error occurred while getting imports:", error);
        }
      }
    }
  }, [project, codeRunTriggered, senseHatAlwaysEnabled, skulptFallback, t]);
  return (
    <>
      <PyodideRunner active={activeRunner === "pyodide"} />
      <SkulptRunner
        active={activeRunner === "skulpt"}
        outputPanels={outputPanels}
      />
    </>
  );
};

export default PythonRunner;
