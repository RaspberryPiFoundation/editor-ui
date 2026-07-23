import React from "react";
import "../../../assets/stylesheets/AstroPiModel.scss?inline";
import ResetIcon from "../../../assets/icons/reset.svg";

const OrientationResetButton = (props) => {
  const { resetOrientation } = props;

  return (
    <button onClick={(e) => resetOrientation(e)}>
      <ResetIcon />
    </button>
  );
};

export default OrientationResetButton;
