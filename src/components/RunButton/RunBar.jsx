import React from "react";
import RunnerControls from "./RunnerControls";

import "../../assets/stylesheets/RunBar.scss";
import SaveButton from "../SaveButton/SaveButton";
import ProgressBar from "../Menus/Sidebar/InstructionsPanel/ProgressBar";

const RunBar = ({ embedded = false }) => {
  return (
    <div className="run-bar">
      {/* <ProgressBar /> */}
      {/* <SaveButton /> */}
      <RunnerControls embedded={embedded} />
    </div>
  );
};

export default RunBar;
