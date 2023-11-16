import React from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import DownloadButton from "../../../DownloadButton/DownloadButton";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import DownloadIcon from "../../../../assets/icons/download.svg";
import "../../../../assets/stylesheets/DownloadPanel.scss";

export const DownloadPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("downloadPanel.heading")}>
      <div className="download-panel__content">
        <div className="download-panel__subtitle">
          {t("downloadPanel.subtitle")}
        </div>
        <p>{t("downloadPanel.logInHint")}</p>
        <div className="download-panel__button-container">
          <DesignSystemButton
            className="btn btn--primary download-panel__button"
            text={t("downloadPanel.logInButton")}
            onClick={() => {
              console.log("Log in clicked");
            }}
          />
          <DesignSystemButton
            className="btn btn--secondary download-panel__button"
            text={t("downloadPanel.signUpButton")}
            onClick={() => {
              console.log("Sign up clicked");
            }}
          />
        </div>
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
