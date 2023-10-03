import React from "react";
import RunnerControls from "./RunnerControls";

import "./RunBar.scss";
// import SaveButton from "../SaveButton/SaveButton";

const RunBar = ({ embedded = false }) => {
  return (
    <div className="run-bar">
      {/* <SaveButton /> */}
      <RunnerControls embedded={embedded} />
    </div>
  );
};

export default RunBar;
