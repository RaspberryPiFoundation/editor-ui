import Button from "../Button/Button";

import React from "react";
import { useDispatch } from "react-redux";
import { triggerCodeRun } from "../Editor/EditorSlice";

const RunButton = ({ embedded = false, className, ...props }) => {
  const dispatch = useDispatch();

  const onClickRun = () => {
    if (window.plausible) {
      window.plausible(`Run button${embedded ? " embedded" : ""}`);
    }
    dispatch(triggerCodeRun());
  };

  return (
    <Button
      className={`btn--primary btn--run${className ? ` ${className}` : ""}`}
      onClickHandler={onClickRun}
      {...props}
    />
  );
};

export default RunButton;
