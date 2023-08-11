import React from "react";
import Button from "../../../Button/Button";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";

import "./ProjectsPanel.scss";
import ProjectName from "../../../ProjectName/ProjectName";
import ProjectInfo from "./ProjectInfo/ProjectInfo";
import { DownloadIcon } from "../../../../Icons";
import DownloadButton from "../../../DownloadButton/DownloadButton";
import { useSelector } from "react-redux";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";

const ProjectsPanel = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const isLoggedIn = useSelector((state) => state?.auth?.user);

  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  console.log(MOBILE_MEDIA_QUERY);

  return (
    <SidebarPanel
      heading={t("projectsPanel.projects")}
      Button={() =>
        isLoggedIn ? (
          <Button
            text={t("projectsPanel.yourProjectsButton")}
            className="btn--primary projects-panel__your-projects-button"
            buttonIconPosition="right"
            href={`/${locale}/projects`}
          />
        ) : null
      }
      className="projects-panel-wrapper"
    >
      <ProjectName showLabel={true} className="projects-panel__item" />
      <ProjectInfo className="projects-panel__item" />
      <DownloadButton
        buttonText={t("header.download")}
        className="btn--secondary projects-panel__download-button"
        Icon={DownloadIcon}
        buttonIconPosition="right"
      />
      {isMobile ? <SaveButton /> : null}
    </SidebarPanel>
  );
};

export default ProjectsPanel;
