import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";

const Output = ({ outputPanels = ["text", "visual"], autoRun = false }) => {
  const project = useSelector((state) => state.editor.project);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const searchParams = new URLSearchParams(window.location.search);
  const isBrowserPreview = searchParams.get("browserPreview") === "true";
  const isAutoRun = autoRun || searchParams.get("autoRun") === "true";

  return (
    <>
      <ExternalFiles />
      <div className="proj-runner-container" data-testid="output">
        <RunnerFactory
          projectType={project.project_type}
          outputPanels={outputPanels}
          autoRun={isAutoRun}
        />
        {isEmbedded && !isBrowserPreview && <RunBar embedded />}
      </div>
    </>
  );
};

export default Output;
