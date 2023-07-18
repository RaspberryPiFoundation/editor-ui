import React from "react";
import Button from "../../../Button/Button";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";

import "./ProjectsPanel.scss";
import { useSelector } from "react-redux";
import ProjectName from "../../../ProjectName/ProjectName";
import ProjectInfo from "./ProjectInfo/ProjectInfo";
import { DownloadIcon } from "../../../../Icons";
import DownloadButton from "../../../DownloadButton/DownloadButton";

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

  // TODO: Check loading behaviour, should panel always be available?
  // TODO: Positioning in header goes funky on save, pre-existing?
  // TODO: Project name in header not updated when updated in sidebar (and vice versa?)
  // TOOD: Console errors

  return (
    <SidebarPanel
      heading={t("projectsPanel.projects")}
      Button={YourProjectsButton}
      className="projects-panel-wrapper"
    >
      <ProjectName
        label="projectsPanel.projectNameLabel"
        className="projects-panel__item"
      />
      <ProjectInfo className="projects-panel__item" />
      <DownloadButton
        buttonText={t("header.download")}
        className="btn--secondary projects-panel__download-button"
        Icon={DownloadIcon}
        buttonIconPosition="right"
      />
    </SidebarPanel>
  );
};

export default ProjectsPanel;
