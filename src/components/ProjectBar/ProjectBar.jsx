import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SaveStatus from "../SaveStatus/SaveStatus";
import DownloadIcon from "../../assets/icons/download.svg";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import SaveButton from "../SaveButton/SaveButton";

import "../../assets/stylesheets/ProjectBar.scss";
import { isOwner } from "../../utils/projectHelpers";

const ProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();

  const project = useSelector((state) => state.editor.project);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const projectOwner = isOwner(user, project);
  const readOnly = useSelector((state) => state.editor.readOnly);

  return (
    loading === "success" && (
      <div className="project-bar">
        {loading === "success" && (
          <ProjectName editable={!readOnly && nameEditable} />
        )}
        <div className="project-bar__right">
          {loading === "success" && (
            <div className="project-bar__btn-wrapper">
              <DownloadButton
                buttonText={t("header.download")}
                className="btn btn--tertiary project-bar__btn"
                Icon={DownloadIcon}
                type="tertiary"
              />
            </div>
          )}
          {loading === "success" && !projectOwner && !readOnly && (
            <div className="project-bar__btn-wrapper">
              <SaveButton className="project-bar__btn btn--save" />
            </div>
          )}
          {lastSavedTime && user && !readOnly && (
            <SaveStatus saving={saving} lastSavedTime={lastSavedTime} />
          )}
        </div>
      </div>
    )
  );
};

export default ProjectBar;
