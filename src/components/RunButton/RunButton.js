import Button from "../Button/Button";

import React from "react";
import { useDispatch } from "react-redux";
import { triggerCodeRun } from "../Editor/EditorSlice";

const RunButton = ({ embedded = false, ...props }) => {
  const dispatch = useDispatch();

  const onClickRun = () => {
    if (window.plausible) {
      window.plausible(`Run button${embedded ? " embedded" : ""}`);
    }
    dispatch(triggerCodeRun());
  };

  return (
    <Button
      className={"btn--primary btn--run"}
      onClickHandler={onClickRun}
      {...props}
    />
  );
};

export default RunButton;
