import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProject, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import WebComponentProject from "../components/WebComponentProject/WebComponentProject";
import { useTranslation } from "react-i18next";
import { setStepNumber, setSteps } from "../redux/InstructionsSlice";

const WebComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { code, senseHatAlwaysEnabled, stepNumber, steps } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const proj = {
      type: "python",
      components: [{ name: "main", extension: "py", content: code }],
    };
    dispatch(
      setSenseHatAlwaysEnabled(typeof senseHatAlwaysEnabled !== "undefined"),
    );
    dispatch(setProject(proj));
  }, [code, senseHatAlwaysEnabled, dispatch]);

  useEffect(() => {
    dispatch(setStepNumber(stepNumber));
  }, [stepNumber, dispatch]);

  useEffect(() => {
    if (steps) {
      dispatch(setSteps(steps));
    }
  }, [steps, dispatch]);

  return loading === "success" ? (
    <>
      <WebComponentProject />
    </>
  ) : (
    <>
      <p>{t("webComponent.loading")}</p>;
    </>
  );
};

export default WebComponentLoader;
