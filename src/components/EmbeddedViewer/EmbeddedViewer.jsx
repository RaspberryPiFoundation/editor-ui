/* eslint-disable react-hooks/exhaustive-deps */
import "../../assets/stylesheets/EmbeddedViewer.scss";
import "../../assets/stylesheets/Project.scss";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";

import { useProject } from "../../hooks/useProject";
import { useEmbeddedMode } from "../../hooks/useEmbeddedMode";
import { setBrowserPreview, setPage } from "../../redux/EditorSlice";
// import Output from "../Editor/Output/Output";
import NotFoundModalEmbedded from "../Modals/NotFoundModalEmbedded";
import AccessDeniedNoAuthModalEmbedded from "../Modals/AccessDeniedNoAuthModalEmbedded";

const EmbeddedViewer = () => {
  const dispatch = useDispatch();

  const page = useSelector((state) => state.editor.page);
  // const loading = useSelector((state) => state.editor.loading);
  const browserPreview = useSelector((state) => state.editor.browserPreview);
  const user = useSelector((state) => state.auth.user) || {};
  const notFoundModalShowing = useSelector(
    (state) => state.editor.notFoundModalShowing,
  );
  const accessDeniedNoAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedNoAuthModalShowing,
  );
  const { identifier } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  useProject({
    projectIdentifier: identifier,
    accessToken: user.access_token,
  });

  useEmbeddedMode(true);

  useEffect(() => {
    if (browserPreview) {
      setSearchParams({
        ...Object.fromEntries([...searchParams]),
        page,
      });
    }
  }, [page]);

  useEffect(() => {
    if (searchParams.get("browserPreview") === "true") {
      dispatch(setBrowserPreview(true));
    }

    if (searchParams.get("page")) {
      dispatch(setPage(searchParams.get("page")));
    }
  }, []);

  return (
    <div className="embedded-viewer">
      {/* TODO: Setup the web component to allow output only! */}
      {/* {loading === "success" ? <Output /> : null} */}
      {notFoundModalShowing ? <NotFoundModalEmbedded /> : null}
      {accessDeniedNoAuthModalShowing ? (
        <AccessDeniedNoAuthModalEmbedded />
      ) : null}
    </div>
  );
};

export default EmbeddedViewer;
