import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";

const Output = () => {
  const project = useSelector((state) => state.editor.project);
  const isPico = useSelector((state) => state.editor.picoPort);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const searchParams = new URLSearchParams(window.location.search);
  const isBrowserPreview = searchParams.get("browserPreview") === "true";
  const usePyodide = searchParams.get("pyodide") === "true";

  return (
    <>
      <ExternalFiles />
      <div className="proj-runner-container">
        <RunnerFactory
          projectType={project.project_type}
          usePyodide={usePyodide}
          isPico={!!isPico}
        />
        {isEmbedded && !isBrowserPreview ? <RunBar embedded /> : null}
      </div>
    </>
  );
};

export default Output;
