import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DownloadIcon from "../../assets/icons/download.svg";
import UploadIcon from "../../assets/icons/upload.svg";
import SaveIcon from "../../assets/icons/save.svg";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import UploadButton from "../UploadButton/UploadButton";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import SaveStatus from "../SaveStatus/SaveStatus";

import "../../assets/stylesheets/ProjectBar.scss";
import { setScratchLastSavedTime } from "../../redux/EditorSlice";
import { useScratchSave } from "../../hooks/useScratchSave";

const getProjectLastSavedTime = (updatedAt) => {
  const timestamp = Date.parse(updatedAt || "");
  return Number.isNaN(timestamp) ? null : timestamp;
};

const ScratchProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const project = useSelector((state) => state.editor.project);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const canSave = Boolean(user && !readOnly);
  const saveDisabled = useSelector((state) => state.editor.saveDisabled);
  const { saveScratchProject, shouldRemixOnSave } = useScratchSave({
    enabled: canSave && !saveDisabled,
  });

  const projectIdentifier = project?.identifier;
  const isScratchSaving = saving === "pending";
  const isScratchSaveFailed = saving === "failed";
  const isNewProject = !projectIdentifier;
  const canAutoSave = Boolean(projectIdentifier && !shouldRemixOnSave);
  const showSaveButton =
    canSave && (isNewProject || shouldRemixOnSave) && !saveDisabled;
  const showSaveStatus =
    canSave && canAutoSave && Boolean(lastSavedTime) && !isScratchSaveFailed;
  const projectLastSavedTime = getProjectLastSavedTime(project?.updated_at);

  useEffect(() => {
    if (!canSave || !canAutoSave || lastSavedTime || !projectLastSavedTime) {
      return;
    }

    dispatch(
      setScratchLastSavedTime({
        lastSavedTime: projectLastSavedTime,
      }),
    );
  }, [dispatch, canAutoSave, canSave, lastSavedTime, projectLastSavedTime]);

  if (loading !== "success") {
    return null;
  }

  return (
    <div className="project-bar" data-testid="scratch-project-bar">
      <ProjectName editable={!readOnly && nameEditable} isHeading={true} />
      <div className="project-bar__right">
        {!readOnly && (
          <div className="project-bar__btn-wrapper">
            <UploadButton
              buttonText={t("header.upload")}
              className="btn btn--tertiary project-bar__btn"
              Icon={UploadIcon}
              type="tertiary"
            />
          </div>
        )}
        <div className="project-bar__btn-wrapper">
          <DownloadButton
            buttonText={t("header.download")}
            className="btn btn--tertiary project-bar__btn"
            Icon={DownloadIcon}
            type="tertiary"
          />
        </div>
        {showSaveButton && (
          <div className="project-bar__btn-wrapper">
            <DesignSystemButton
              className="project-bar__btn btn--save btn--primary"
              onClick={() => saveScratchProject({ shouldRemixOnSave })}
              text={t("header.save")}
              textAlways
              icon={<SaveIcon />}
              type="primary"
              disabled={isScratchSaving}
            />
          </div>
        )}
        {showSaveStatus && <SaveStatus />}
      </div>
    </div>
  );
};

export default ScratchProjectBar;
