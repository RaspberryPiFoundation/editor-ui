import React from "react";
import { useSelector } from "react-redux";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";

const Output = () => {
  const project = useSelector((state) => state.editor.project);
  return (
    <>
      <ExternalFiles />
      <div className='proj-runner-container'>
        <RunnerFactory projectType={project.type} />
      </div>
    </>
  )
}

export default Output
