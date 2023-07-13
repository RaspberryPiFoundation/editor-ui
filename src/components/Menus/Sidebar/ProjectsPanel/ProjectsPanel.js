import React from "react";
import Button from "../../../Button/Button";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";

import "./ProjectsPanel.scss";
import { useSelector } from "react-redux";
import ProjectName from "../../../ProjectName/ProjectName";

const YourProjectsButton = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  return (
    <Button
      text={t("projectsPanel.yourProjectsButton")}
      className="btn--primary projects-panel__your-projects-button"
      buttonIconPosition="right"
      buttonHref={`/${locale}/projects`}
    />
  );
};

const ProjectsPanel = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const loading = useSelector((state) => state.editor.loading);
  const saving = useSelector((state) => state.editor.saving);

  return (
    <SidebarPanel
      heading={t("projectsPanel.projects")}
      Button={YourProjectsButton}
    >
      {loading === "success" ? <ProjectName /> : null}
    </SidebarPanel>
  );
};

export default ProjectsPanel;
