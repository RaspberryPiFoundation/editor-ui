import React from "react";
import { useSelector } from "react-redux";
import { useEmbeddedMode } from "../hooks/useEmbeddedMode";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";

import { MOBILE_MEDIA_QUERY } from "../utils/mediaQueryBreakpoints";

import Project from "../components/Editor/Project/Project";
import MobileProject from "../components/Mobile/MobileProject/MobileProject";
import NewFileModal from "../components/Modals/NewFileModal";
import NotFoundModal from "../components/Modals/NotFoundModal";
import AccessDeniedNoAuthModal from "../components/Modals/AccessDeniedNoAuthModal";
import AccessDeniedWithAuthModal from "../components/Modals/AccessDeniedWithAuthModal";
import RenameFileModal from "../components/Modals/RenameFileModal";

const ProjectComponentLoader = (props) => {
  const { identifier } = useParams();
  const embedded = props.embedded || false;

  const modals = useSelector((state) => state.editor.modals);
  const newFileModalShowing = useSelector(
    (state) => state.editor.newFileModalShowing,
  );
  const renameFileModalShowing = useSelector(
    (state) => state.editor.renameFileModalShowing,
  );
  const notFoundModalShowing = useSelector(
    (state) => state.editor.notFoundModalShowing,
  );
  const accessDeniedNoAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedNoAuthModalShowing,
  );
  const accessDeniedWithAuthModalShowing = useSelector(
    (state) => state.editor.accessDeniedWithAuthModalShowing,
  );

  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  useEmbeddedMode(embedded);

  // TODO: sort out loading and error states
  // useEffect(() => {
  //   if (loading === "idle" && identifier) {
  //     navigate(`/${i18n.language}/projects/${identifier}`);
  //   }
  //   if (loading === "failed") {
  //     navigate("/");
  //   }
  // }, [loading, i18n.language, navigate]);

  return (
    <>
      {isMobile ? (
        <MobileProject identifier={identifier} />
      ) : (
        <Project identifier={identifier} />
      )}
      {newFileModalShowing ? <NewFileModal /> : null}
      {renameFileModalShowing && modals.renameFile ? <RenameFileModal /> : null}
      {notFoundModalShowing ? <NotFoundModal /> : null}
      {accessDeniedNoAuthModalShowing ? <AccessDeniedNoAuthModal /> : null}
      {accessDeniedWithAuthModalShowing ? <AccessDeniedWithAuthModal /> : null}
    </>
  );
};

export default ProjectComponentLoader;
