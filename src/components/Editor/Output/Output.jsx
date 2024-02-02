import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";

const Output = ({
  embedded = false,
  browserPreview = false,
  outputPanels = ["text", "visual"],
}) => {
  const project = useSelector((state) => state.editor.project);
  const isEmbedded =
    useSelector((state) => state.editor.isEmbedded) || embedded;
  const searchParams = new URLSearchParams(window.location.search);
  const isBrowserPreview =
    searchParams.get("browserPreview") === "true" || browserPreview;
  const webComponent = useSelector((state) => state.editor.webComponent);

  return (
    <>
      <ExternalFiles />
      <div className="proj-runner-container">
        <RunnerFactory
          projectType={project.project_type}
          outputPanels={outputPanels}
        />
        {!webComponent && isEmbedded && !isBrowserPreview && (
          <RunBar embedded />
        )}
      </div>
    </>
  );
};

export default Output;
