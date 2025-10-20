import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { triggerCodeRun } from "../../redux/EditorSlice";
import { Button } from "@raspberrypifoundation/design-system-react";

const RunButton = ({ embedded = false, ...props }) => {
  const codeRunLoading = useSelector((state) => state.editor.codeRunLoading);
  const activeRunner = useSelector((state) => state.editor.activeRunner);
  const loadedRunner = useSelector((state) => state.editor.loadedRunner);
  const dispatch = useDispatch();

  const onClickRun = () => {
    if (window.plausible) {
      window.plausible(`Run button${embedded ? " embedded" : ""}`);
    }
    dispatch(triggerCodeRun());
  };

  return (
    <Button
      disabled={
        !activeRunner || activeRunner !== loadedRunner || codeRunLoading
      }
      onClick={onClickRun}
      {...props}
    />
  );
};

export default RunButton;
