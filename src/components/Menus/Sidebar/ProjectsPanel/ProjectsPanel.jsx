import React from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";

import "../../../../assets/stylesheets/ProjectsPanel.scss";
import ProjectName from "../../../ProjectName/ProjectName";
import ProjectInfo from "./ProjectInfo/ProjectInfo";
import DownloadButton from "../../../DownloadButton/DownloadButton";
import SaveButton from "../../../SaveButton/SaveButton";
import { useSelector } from "react-redux";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";
import SaveStatus from "../../../SaveStatus/SaveStatus";
import { Button } from "@raspberrypifoundation/design-system-react";
import { navigateToProjectsPageEvent } from "../../../../events/WebComponentCustomEvents";

const ProjectsPanel = () => {
  const { t } = useTranslation();

  const isLoggedIn = useSelector((state) => state?.auth?.user);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const readOnly = useSelector((state) => state.editor.readOnly);

  const saveOptions = (
    <>
      <div className="projects-panel__save">
        <SaveButton className="projects-panel__save-button" />
      </div>
      <div className="projects-panel__save-status">
        <SaveStatus isMobile={isMobile} />
      </div>
    </>
  );

  const navigateToProjectsPage = () => {
    document.dispatchEvent(navigateToProjectsPageEvent);
  };

  return (
    <SidebarPanel
      heading={t("projectsPanel.projects")}
      Button={() =>
        isLoggedIn && (
          <Button
            className="btn--primary projects-panel__your-projects-button"
            onClick={navigateToProjectsPage}
            text={t("projectsPanel.yourProjectsButton")}
          />
        )
      }
      className="projects-panel-wrapper"
    >
      <ProjectName
        showLabel={true}
        className="projects-panel__item"
        editable={!readOnly}
      />
      <ProjectInfo className="projects-panel__item" />
      <div className="projects-panel__button">
        <DownloadButton
          text={t("header.download")}
          className="projects-panel__download-button"
        />
      </div>
      {isMobile && saveOptions}
    </SidebarPanel>
  );
};

export default ProjectsPanel;
