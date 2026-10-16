import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SaveStatus from "../SaveStatus/SaveStatus";
import OfflineBadge from "../OfflineBadge/OfflineBadge";
import DownloadIcon from "../../assets/icons/download.svg";
import UploadIcon from "../../assets/icons/upload.svg";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import SaveButton from "../SaveButton/SaveButton";
import UploadButton from "../UploadButton/UploadButton";
import ScratchProjectBarActions from "./ScratchProjectBarActions";
import useIsOnline from "../../hooks/useIsOnline";
import { usePreviewMode } from "../../hooks/usePreviewMode";

import "../../assets/stylesheets/ProjectBar.scss?inline";
import { isOwner } from "../../utils/projectHelpers";

const ProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();
  const project = useSelector((state) => state.editor.project);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const offlineEnabled = useSelector((state) => state.editor.offlineEnabled);
  const projectOwner = isOwner(user, project);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const previewMode = usePreviewMode();
  const canEdit = !readOnly && !previewMode;
  const isScratchProject = project?.project_type === "code_editor_scratch";
  const isOnline = useIsOnline();

  if (loading !== "success") {
    return null;
  }

  return (
    <div
      className={`project-bar${isScratchProject ? " scratch-project-bar" : ""}`}
      data-testid={
        isScratchProject ? "scratch-project-bar" : "default-project-bar"
      }
    >
      <ProjectName editable={canEdit && nameEditable} isHeading={true} />
      <div className="project-bar__right">
        {isScratchProject && !readOnly && (
          <UploadButton buttonText={t("header.upload")} Icon={UploadIcon} />
        )}
        <DownloadButton buttonText={t("header.download")} Icon={DownloadIcon} />
        {isScratchProject ? (
          <ScratchProjectBarActions canSave={Boolean(user && canEdit)} />
        ) : (
          <>
            {!projectOwner && canEdit && <SaveButton />}
            {user &&
              canEdit &&
              (offlineEnabled && !isOnline
                ? projectOwner && <OfflineBadge />
                : lastSavedTime && <SaveStatus />)}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectBar;
