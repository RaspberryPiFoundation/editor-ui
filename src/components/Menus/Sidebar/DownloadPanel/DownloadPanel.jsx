import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import SidebarPanel from "../SidebarPanel";
import DownloadButton from "../../../DownloadButton/DownloadButton";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import DownloadIcon from "../../../../assets/icons/download.svg";

import {
  logInEvent,
  signUpEvent,
} from "../../../../events/WebComponentCustomEvents";
import "../../../../assets/stylesheets/DownloadPanel.scss";

export const DownloadPanel = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  const handleLogIn = () => {
    document.dispatchEvent(logInEvent);
  };

  const handleSignUp = () => {
    document.dispatchEvent(signUpEvent);
  };

  return (
    <SidebarPanel heading={t("downloadPanel.heading")}>
      <div className="download-panel__content">
        {!user && (
          <>
            <div className="download-panel__subtitle">
              {t("downloadPanel.logInTitle")}
            </div>
            <p>{t("downloadPanel.logInHint")}</p>
            <div className="download-panel__button-container">
              <DesignSystemButton
                className="btn btn--primary download-panel__button"
                text={t("downloadPanel.logInButton")}
                type="primary"
                onClick={handleLogIn}
              />
              <DesignSystemButton
                className="btn btn--secondary download-panel__button"
                text={t("downloadPanel.signUpButton")}
                type="secondary"
                onClick={handleSignUp}
              />
            </div>
          </>
        )}
        <p>{t("downloadPanel.downloadHint")}</p>
        <DownloadButton
          buttonText={t("downloadPanel.downloadButton")}
          className="btn btn--secondary download-panel__button"
          Icon={DownloadIcon}
        />
      </div>
    </SidebarPanel>
  );
};

export default DownloadPanel;
