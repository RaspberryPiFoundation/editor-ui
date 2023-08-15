import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useProject } from "../Hooks/useProject";
import { useEmbeddedMode } from "../Hooks/useEmbeddedMode";
import { useMediaQuery } from "react-responsive";
import Project from "../Project/Project";
import MobileProject from "../../Mobile/MobileProject/MobileProject";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier } = useParams();
  const embedded = props.embedded || false;
  const user = useSelector((state) => state.auth.user);
  const accessToken = user ? user.access_token : null;

  const project = useSelector((state) => state.editor.project);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  useEmbeddedMode(embedded);
  useProject({ projectIdentifier: identifier, accessToken: accessToken });

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      navigate(`/${i18n.language}/projects/${project.identifier}`);
    }
    if (loading === "failed") {
      navigate("/");
    }
  }, [loading, project, i18n.language, navigate]);

  return loading === "success" ? (
    isMobile ? (
      <MobileProject />
    ) : (
      <Project />
    )
  ) : loading === "pending" ? (
    <p>{t("project.loading")}</p>
  ) : null;
};

export default ProjectComponentLoader;
