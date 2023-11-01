/* eslint-disable react-hooks/exhaustive-deps */
import "../../assets/stylesheets/EmbeddedViewer.scss";
import "../../assets/stylesheets/Project.scss";
import React from "react";
import { useSelector } from "react-redux";
import { useProject } from "../../hooks/useProject";
import { useEmbeddedMode } from "../../hooks/useEmbeddedMode";
import Output from "../Editor/Output/Output";
import { useParams, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const isBrowserPreview = searchParams.get("browserPreview") === "true";

  useProject({
    projectIdentifier: identifier,
    accessToken: user.access_token,
    isEmbedded: true,
    isBrowserPreview,
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
