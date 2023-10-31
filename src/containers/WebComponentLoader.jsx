import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useProject } from "../hooks/useProject";
import { setProject, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import WebComponentProject from "../components/WebComponentProject/WebComponentProject";
import { useTranslation } from "react-i18next";
import { setInstructions } from "../redux/InstructionsSlice";

const WebComponentLoader = (props) => {
  console.log("IN WEBCOMPOENT LOADER");
  const project = useSelector((state) => state.editor.project);
  console.log(project);
  const loading = useSelector((state) => state.editor.loading);
  const { code, senseHatAlwaysEnabled = false, instructions } = props;
  if (instructions) {
    console.log(instructions.project.id);
    localStorage.setItem(instructions.project.id, JSON.stringify(project));
  }

  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const proj = {
      type: "python",
      components: [{ name: "main", extension: "py", content: code }],
    };
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
    dispatch(setProject(proj));
  }, [code, senseHatAlwaysEnabled, dispatch]);

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
