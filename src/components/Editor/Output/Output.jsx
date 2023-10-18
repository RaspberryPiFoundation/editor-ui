import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";

const Output = ({
  minHeight = "100%",
  defaultWidth,
  minWidth,
  maxWidth,
  panelDirection = "column",
}) => {
  const project = useSelector((state) => state.editor.project);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const searchParams = new URLSearchParams(window.location.search);
  const isBrowserPreview = searchParams.get("browserPreview") === "true";

  return (
    <div
      style={{
        minHeight: minHeight,
        width: defaultWidth,
        minWidth,
        maxWidth,
        flex: panelDirection === "column" ? "0 1 auto" : "1 0 auto",
      }}
    >
      <ExternalFiles />
      <div className="proj-runner-container">
        <RunnerFactory projectType={project.project_type} />
        {isEmbedded && !isBrowserPreview ? <RunBar embedded /> : null}
      </div>
    </div>
  );
};

export default Output;
