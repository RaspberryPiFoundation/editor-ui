import "./ProjectStatus.scss";
import SaveButton from "../SaveButton/SaveButton";
import { useSelector, shallowEqual } from "react-redux";
import React from "react";

const ProjectStatus = () => {
  const project = useSelector((state) => state.editor.project, shallowEqual);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="project-status">
      <p className="project-status__name">{project.name}</p>
      {lastSavedTime && user ? <SaveButton /> : null}
    </div>
  );
};

export default ProjectStatus;
