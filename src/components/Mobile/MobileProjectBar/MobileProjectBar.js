import "./MobileProjectBar.scss";
import SaveStatus from "../../SaveStatus/SaveStatus";
import { useSelector } from "react-redux";
import React from "react";

const MobileProjectBar = () => {
  const projectName = useSelector((state) => state.editor.project.name);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);

  return (
    <div className="mobile-project-bar">
      <p className="mobile-project-bar__name">{projectName}</p>
      {lastSavedTime ? <SaveStatus /> : null}
    </div>
  );
};

export default MobileProjectBar;
