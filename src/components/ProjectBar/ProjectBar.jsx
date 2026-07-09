import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SaveStatus from "../SaveStatus/SaveStatus";
import OfflineBadge from "../OfflineBadge/OfflineBadge";
import DownloadIcon from "../../assets/icons/download.svg";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import SaveButton from "../SaveButton/SaveButton";
import useIsOnline from "../../hooks/useIsOnline";

import "../../assets/stylesheets/ProjectBar.scss";
import { isOwner } from "../../utils/projectHelpers";

const ProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();
  const project = useSelector((state) => state.editor.project);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const offlineEnabled = useSelector((state) => state.editor.offlineEnabled);
  const saveDisabled = useSelector((state) => state.editor.saveDisabled);
  const projectOwner = isOwner(user, project);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const isOnline = useIsOnline();

  if (loading !== "success") {
    return null;
  }

  return (
    <div className="project-bar" data-testid="default-project-bar">
      <ProjectName editable={!readOnly && nameEditable} isHeading={true} />
      <div className="project-bar__right">
        <div className="project-bar__btn-wrapper">
          <DownloadButton
            buttonText={t("header.download")}
            className="btn btn--tertiary project-bar__btn"
            Icon={DownloadIcon}
            type="tertiary"
          />
        </div>
        {!projectOwner && !readOnly && !saveDisabled && (
          <div className="project-bar__btn-wrapper">
            <SaveButton className="project-bar__btn btn--save" />
          </div>
        )}
        {user &&
          !readOnly &&
          (offlineEnabled && !isOnline
            ? projectOwner && (
                <div className="project-bar__btn-wrapper">
                  <OfflineBadge className="project-bar__btn" />
                </div>
              )
            : lastSavedTime && <SaveStatus />)}
      </div>
    </div>
  );
};

export default ProjectBar;
