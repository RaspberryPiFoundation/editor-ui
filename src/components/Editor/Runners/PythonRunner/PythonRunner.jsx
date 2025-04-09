import React, { useEffect, useState } from "react";

import PyodideRunner from "./PyodideRunner/PyodideRunner";
import SkulptRunner from "./SkulptRunner/SkulptRunner";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { loadingRunner } from "../../../../redux/EditorSlice";
import { getImports } from "../../../../utils/getImports";

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

    for (const component of project.components || []) {
      if (component.extension === "py" && !codeRunTriggered) {
        try {
          const imports = getImports(component.content, t);
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
      <PyodideRunner
        active={activeRunner === "pyodide"}
        outputPanels={outputPanels}
      />
      <SkulptRunner
        active={activeRunner === "skulpt"}
        outputPanels={outputPanels}
      />
    </>
  );
};

export default PythonRunner;
