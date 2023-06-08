/* eslint-disable react-hooks/exhaustive-deps */
import "./EmbeddedViewer.scss";
import "../Editor/Project/Project.scss";
import React from "react";
import { useSelector } from "react-redux";
import { useProject } from "../Editor/Hooks/useProject";
import { useEmbeddedMode } from "../Editor/Hooks/useEmbeddedMode";
import Output from "../Editor/Output/Output";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotFoundModalEmbedded from "../Modals/NotFoundModalEmbedded";
import AccessDeniedNoAuthModalEmbedded from "../Modals/AccessDeniedNoAuthModalEmbedded";
import AccessDeniedWithAuthModalEmbedded from "../Modals/AccessDeniedWithAuthModalEmbedded";

const EmbeddedViewer = () => {
  const loading = useSelector((state) => state.editor.loading);
  const notFoundModalShowing = useSelector(
    (state) => state.editor.notFoundModalShowing,
  );
  const accessDeniedNoAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedNoAuthModalShowing,
  );
  const accessDeniedWithAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedWithAuthModalShowing,
  );
  const { identifier } = useParams();
  const { i18n } = useTranslation();

  useProject(identifier, i18n.language);
  useEmbeddedMode(true);

  return (
    <div className="embedded-viewer">
      {loading === "success" ? <Output /> : null}
      {notFoundModalShowing ? <NotFoundModalEmbedded /> : null}
      {accessDeniedNoAuthModalShowing ? (
        <AccessDeniedNoAuthModalEmbedded />
      ) : null}
      {accessDeniedWithAuthModalShowing ? (
        <AccessDeniedWithAuthModalEmbedded />
      ) : null}
    </div>
  );
};

export default EmbeddedViewer;
