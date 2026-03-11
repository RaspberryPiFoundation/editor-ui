import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SaveStatus from "../SaveStatus/SaveStatus";
import DownloadIcon from "../../assets/icons/download.svg";
import SaveIcon from "../../assets/icons/save.svg";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import SaveButton from "../SaveButton/SaveButton";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

import "../../assets/stylesheets/ProjectBar.scss";
import { isOwner } from "../../utils/projectHelpers";
import { useScratchSaveState } from "../../hooks/useScratchSaveState";

const ProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();

  const project = useSelector((state) => state.editor.project);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const projectOwner = isOwner(user, project);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const isScratchProject = project?.project_type === "code_editor_scratch";
  const showScratchSaveButton = Boolean(isScratchProject && user && !readOnly);
  const enableScratchSaveState = Boolean(
    loading === "success" && showScratchSaveButton,
  );
  const { isScratchSaving, saveScratchProject, scratchSaveLabelKey } =
    useScratchSaveState({
      enabled: enableScratchSaveState,
    });
  const scratchSaveLabel = t(scratchSaveLabelKey);

  if (loading !== "success") {
    return null;
  }

  return (
    <div className="project-bar">
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
        {!isScratchProject && !projectOwner && !readOnly && (
          <div className="project-bar__btn-wrapper">
            <SaveButton className="project-bar__btn btn--save" />
          </div>
        )}
        {showScratchSaveButton && (
          <div className="project-bar__btn-wrapper">
            <DesignSystemButton
              className="project-bar__btn btn--save btn--primary"
              onClick={saveScratchProject}
              text={scratchSaveLabel}
              textAlways
              icon={<SaveIcon />}
              type="secondary"
              disabled={isScratchSaving}
            />
          </div>
        )}
        {lastSavedTime && user && !readOnly && !isScratchProject && (
          <SaveStatus saving={saving} lastSavedTime={lastSavedTime} />
        )}
      </div>
    </div>
  );
};

export default ProjectBar;
