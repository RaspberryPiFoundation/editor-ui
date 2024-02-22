import Button from "../Button/Button";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { triggerCodeRun } from "../../redux/EditorSlice";

const RunButton = ({ embedded = false, className, ...props }) => {
  const codeRunLoading = useSelector((state) => state.editor.codeRunLoading);
  const dispatch = useDispatch();

  const onClickRun = () => {
    if (window.plausible) {
      window.plausible(`Run button${embedded ? " embedded" : ""}`);
    }
    dispatch(triggerCodeRun());
  };

  return (
    <Button
      disabled={codeRunLoading}
      className={`btn--primary btn--run${className ? ` ${className}` : ""}`}
      onClickHandler={onClickRun}
      {...props}
    />
  );
};

export default RunButton;
