/* eslint-disable react-hooks/exhaustive-deps */
import "./EmbeddedViewer.scss";
import "../Editor/Project/Project.scss";
import React from "react";
import { useSelector } from "react-redux";
import { useProject } from "../Editor/Hooks/useProject";
import { useEmbeddedMode } from "../Editor/Hooks/useEmbeddedMode";
import Output from "../Editor/Output/Output";
import { useParams } from "react-router-dom";
import NotFoundModalEmbedded from "../Modals/NotFoundModalEmbedded";
import AccessDeniedNoAuthModalEmbedded from "../Modals/AccessDeniedNoAuthModalEmbedded";

const EmbeddedViewer = () => {
  const loading = useSelector((state) => state.editor.loading);
  const notFoundModalShowing = useSelector(
    (state) => state.editor.notFoundModalShowing,
  );
  const accessDeniedNoAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedNoAuthModalShowing,
  );
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user) || {};

  useProject({
    projectIdentifier: identifier,
    accessToken: user.access_token,
    isEmbedded: true,
  });

  useEmbeddedMode(true);

  return (
    <div className="embedded-viewer">
      {loading === "success" ? <Output /> : null}
      {notFoundModalShowing ? <NotFoundModalEmbedded /> : null}
      {accessDeniedNoAuthModalShowing ? (
        <AccessDeniedNoAuthModalEmbedded />
      ) : null}
    </div>
  );
};

export default EmbeddedViewer;
