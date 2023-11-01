import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import WebComponentProject from "../components/WebComponentProject/WebComponentProject";
import { useTranslation } from "react-i18next";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";
import { useProjectPersistence } from "../hooks/useProjectPersistence";

const WebComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const {
    authKey,
    identifier,
    code,
    senseHatAlwaysEnabled = false,
    instructions,
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [projectIdentifier, setProjectIdentifier] = useState(identifier);
  const project = useSelector((state) => state.editor.project);
  const user = JSON.parse(localStorage.getItem(authKey));

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      setProjectIdentifier(project.identifier);
    }
  }, [loading, project]);

  useProject({
    projectIdentifier: projectIdentifier,
    code,
    accessToken: user && user.access_token,
  });
  useProjectPersistence({
    user: user,
  });

  useEffect(() => {
    dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
  }, [senseHatAlwaysEnabled, dispatch]);

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
