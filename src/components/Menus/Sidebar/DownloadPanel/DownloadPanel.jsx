import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import SidebarPanel from "../SidebarPanel";
import DownloadButton from "../../../DownloadButton/DownloadButton";
import SaveButton from "../../../SaveButton/SaveButton";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import DownloadIcon from "../../../../assets/icons/download.svg";
import UploadIcon from "../../../../assets/icons/upload.svg";
import { isOwner } from "../../../../utils/projectHelpers";

import {
  logInEvent,
  signUpEvent,
} from "../../../../events/WebComponentCustomEvents";
import "../../../../assets/stylesheets/DownloadPanel.scss";
import UploadButton from "../../../UploadButton/UploadButton";

export const DownloadPanel = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const projectOwner = isOwner(user, project);

  const handleLogIn = () => {
    if (window.plausible) {
      window.plausible("Login button");
    }
    document.dispatchEvent(logInEvent);
  };

  const handleSignUp = () => {
    document.dispatchEvent(signUpEvent);
  };

  return (
    <SidebarPanel heading={t("downloadPanel.heading")}>
      {!user && (
        <div className="download-panel__login-section">
          <div className="download-panel__subtitle">
            {t("downloadPanel.logInTitle")}
          </div>
          <p className="download-panel__hint">{t("downloadPanel.logInHint")}</p>
          <div className="download-panel__button-container">
            <DesignSystemButton
              className="btn btn--primary download-panel__button"
              text={t("downloadPanel.logInButton")}
              type="primary"
              onClick={handleLogIn}
              fill
            />
            <DesignSystemButton
              className="btn btn--secondary download-panel__button"
              text={t("downloadPanel.signUpButton")}
              type="secondary"
              onClick={handleSignUp}
              fill
            />
          </div>
        </div>
      )}
      <div className="download-panel__download-section">
        <p className="download-panel__hint">
          {t("downloadPanel.downloadHint")}
        </p>
        <div className="download-panel__button-container">
          <DownloadButton
            buttonText={t("downloadPanel.downloadButton")}
            className="btn btn--secondary download-panel__button"
            Icon={DownloadIcon}
            fill
          />
          {/* Upload currently only applies to Scratch; hidden for other project types. */}
          {project.project_type === "code_editor_scratch" && (
            <UploadButton
              buttonText={t("downloadPanel.uploadButton")}
              className="btn btn--secondary download-panel__button"
              Icon={UploadIcon}
              fill
            />
          )}
        </div>
      </div>
      {user && !projectOwner && <SaveButton fill />}
    </SidebarPanel>
  );
};

export default DownloadPanel;
