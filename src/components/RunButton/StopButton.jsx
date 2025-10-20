import { Button } from "@raspberrypifoundation/design-system-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stopCodeRun, stopDraw } from "../../redux/EditorSlice";
import { useTranslation } from "react-i18next";

const StopButton = ({ embedded = false, ...props }) => {
  const codeRunStopped = useSelector((state) => state.editor.codeRunStopped);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onClickStop = () => {
    if (window.plausible) {
      window.plausible(`Stop button${embedded ? " embedded" : ""}`);
    }
    if (codeRunTriggered) {
      dispatch(stopCodeRun());
    }
    dispatch(stopDraw());
  };

  const stop = <Button onClick={onClickStop} {...props} />;
  const [button, setButton] = useState(stop);

  useEffect(() => {
    if (codeRunStopped) {
      const stopping = <Button text={t("runButton.stopping")} disabled />;
      setTimeout(() => {
        setButton(stopping);
      }, 100);
    }
  }, [codeRunStopped, t]);

  return button;
};

export default StopButton;
