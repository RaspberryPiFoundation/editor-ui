import "./ProjectStatus.scss";
import SaveButton from "../SaveButton/SaveButton";
import { useSelector, shallowEqual } from "react-redux";
import React, { useRef } from "react";

const ProjectStatus = () => {
  const project = useSelector((state) => state.editor.project, shallowEqual);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const user = useSelector((state) => state.auth.user);
  const saving = useSelector((state) => state.editor.saving);
  const loading = useSelector((state) => state.editor.loading);

  return (
    loading === "success" && (
      <div className="project-status">
        {lastSavedTime && user ? (
          <SaveButton saving={saving} lastSavedTime={lastSavedTime} />
        ) : null}
        <div className="">
          <p>{project.name}</p>
        </div>
      </div>
    )
  );
};

export default ProjectStatus;
