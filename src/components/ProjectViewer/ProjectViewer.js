/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useProject } from "../Editor/Hooks/useProject";
import PythonRunner from "../Editor/Runners/PythonRunner/PythonRunner";
import { triggerCodeRun } from "../Editor/EditorSlice";
import RunnerControls from "../RunButton/RunnerControls";
import { useParams } from "react-router-dom";

const ProjectViewer = () => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();
  const dispatch = useDispatch();
  useProject({ projectIdentifier: identifier });

  useEffect(() => {
    dispatch(triggerCodeRun());
  }, []);

  return loading === "success" ? (
    <>
      <div className="main-container">
        <h1>Shared project</h1>
        <RunnerControls />
        <div>
          <PythonRunner />
        </div>
      </div>
    </>
  ) : (
    <p>Loading</p>
  );
};

export default ProjectViewer;
