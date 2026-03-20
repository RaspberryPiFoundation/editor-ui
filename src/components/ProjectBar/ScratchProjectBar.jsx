import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DownloadIcon from "../../assets/icons/download.svg";
import UploadIcon from "../../assets/icons/upload.svg";
import SaveIcon from "../../assets/icons/save.svg";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import UploadButton from "../UploadButton/UploadButton";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

import "../../assets/stylesheets/ProjectBar.scss";
import { useScratchSave } from "../../hooks/useScratchSave";

const ScratchProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const showScratchSaveButton = Boolean(user && !readOnly);
  const {
    isScratchSaving,
    saveScratchProject,
    scratchSaveLabelKey,
    shouldRemixOnSave,
  } = useScratchSave({
    enabled: showScratchSaveButton,
  });
  const scratchSaveLabel = t(scratchSaveLabelKey);

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
        {showScratchSaveButton && (
          <div className="project-bar__btn-wrapper">
            <DesignSystemButton
              className="project-bar__btn btn--save btn--primary"
              onClick={() => saveScratchProject({ shouldRemixOnSave })}
              text={scratchSaveLabel}
              textAlways
              icon={<SaveIcon />}
              type="primary"
              disabled={isScratchSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchProjectBar;
