import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";

const Output = ({ embedded = false, browserPreview = false }) => {
  const project = useSelector((state) => state.editor.project);
  const isEmbedded =
    useSelector((state) => state.editor.isEmbedded) || embedded;
  const searchParams = new URLSearchParams(window.location.search);
  const isBrowserPreview =
    searchParams.get("browserPreview") === "true" || browserPreview;
  const usePyodide = searchParams.get("pyodide") === "true";

  return (
    <>
      <ExternalFiles />
      <div className="proj-runner-container" data-testid="output">
        <RunnerFactory
          projectType={project.project_type}
          usePyodide={usePyodide}
        />
        {isEmbedded && !isBrowserPreview && <RunBar embedded />}
      </div>
    </>
  );
};

export default Output;
