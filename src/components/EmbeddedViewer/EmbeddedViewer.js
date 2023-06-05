/* eslint-disable react-hooks/exhaustive-deps */
import "./EmbeddedViewer.scss";
import "../Editor/Project/Project.scss";
import React from "react";
import { useSelector } from "react-redux";
import { useProject } from "../Editor/Hooks/useProject";
import { useEmbeddedMode } from "../Editor/Hooks/useEmbeddedMode";
import Output from "../Editor/Output/Output";
import { useParams } from "react-router-dom";

const EmbeddedViewer = () => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user) || {};

  useProject({
    projectIdentifier: identifier,
    accessToken: user.access_token,
    isEmbedded: true,
  });
  useEmbeddedMode(true);

  return loading === "success" ? (
    <div className="embedded-viewer">
      <Output />
    </div>
  ) : null;
};

export default EmbeddedViewer;
