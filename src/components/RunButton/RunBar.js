import React from "react";
import RunnerControls from "./RunnerControls";

import "./RunBar.scss";

const RunBar = ({ embedded = false }) => {
  return (
    <div className="run-bar">
      <RunnerControls embedded={embedded} />
    </div>
  );
};

export default RunBar;
