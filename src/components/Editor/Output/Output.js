import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";
import { useSearchParams } from "react-router-dom";

const Output = () => {
  const project = useSelector((state) => state.editor.project);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [searchParams] = useSearchParams();
  const isBrowserPreview = searchParams.get("browserPreview") === "true";

  return (
    <>
      <ExternalFiles />
      <div className="proj-runner-container">
        <RunnerFactory projectType={project.project_type} />
        {isEmbedded && !isBrowserPreview ? <RunBar /> : null}
      </div>
    </>
  );
};

export default Output;
