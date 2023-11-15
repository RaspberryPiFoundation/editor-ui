import React from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import Button from "../../../Button/Button";
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
          <Button
            className="btn btn--primary download-panel__button"
            buttonText={t("downloadPanel.logInButton")}
          />
          <Button
            className="btn btn--secondary download-panel__button"
            buttonText={t("downloadPanel.signUpButton")}
          />
        </div>
        <p>{t("downloadPanel.downloadHint")}</p>
      </div>
    </SidebarPanel>
  );
};

export default DownloadPanel;
