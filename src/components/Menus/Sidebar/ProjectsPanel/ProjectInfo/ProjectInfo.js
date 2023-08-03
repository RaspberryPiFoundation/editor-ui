import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import "./ProjectInfo.scss";
import classNames from "classnames";
import SaveStatus from "../../../../SaveStatus/SaveStatus";

const ProjectInfo = ({ className }) => {
  const project_type = useSelector(
    (state) => state.editor.project.project_type,
  );
  const { t } = useTranslation();

  return (
    <>
      <div className={classNames("project-info", className)}>
        <label htmlFor="project_type" className="project-type__label">
          {t("projectsPanel.projectTypeLabel")}
        </label>
        <div className="project-type__text">
          {t(`projectTypes.${project_type}`)}
        </div>
      </div>
      <SaveStatus />
    </>
  );
};

export default ProjectInfo;
