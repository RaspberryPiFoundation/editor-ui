import React from "react";
import "../../../assets/stylesheets/AstroPiModel.scss";
import { ResetIcon } from "../../../Icons";

const OrientationResetButton = (props) => {
  const { resetOrientation } = props;

  return (
    <button onClick={(e) => resetOrientation(e)}>
      <ResetIcon />
    </button>
  );
};

export default OrientationResetButton;
