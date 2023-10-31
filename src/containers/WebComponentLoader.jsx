import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProject, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import WebComponentProject from "../components/WebComponentProject/WebComponentProject";
import { useTranslation } from "react-i18next";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";

const WebComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { code, senseHatAlwaysEnabled = false, instructions } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    let proj = JSON.parse(localStorage.getItem(instructions.project.id));
    if (!proj) {
      proj = {
        type: "python",
        components: [{ name: "main", extension: "py", content: code }],
      };
    }
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
    dispatch(setProject(proj));
  }, [code, senseHatAlwaysEnabled, dispatch, instructions]);

  useEffect(() => {
    if (instructions) {
      dispatch(setInstructions(instructions));
    }
  }, [instructions, dispatch]);

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
