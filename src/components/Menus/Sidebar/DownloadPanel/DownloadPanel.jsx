import React from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
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
            className="download-panel__button"
            text={t("downloadPanel.logInButton")}
          />
          <DesignSystemButton
            className="download-panel__button"
            type="secondary"
            text={t("downloadPanel.signUpButton")}
          />
        </div>
      </div>
    </SidebarPanel>
  );
};

export default DownloadPanel;
