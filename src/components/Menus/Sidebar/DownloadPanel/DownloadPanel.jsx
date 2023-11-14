import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { Button } from "@raspberrypifoundation/design-system-react";
import "../../../../assets/stylesheets/DownloadPanel.scss";

export const DownloadPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("downloadPanel.heading")}>
      <div className="download-panel__subtitle">
        {t("downloadPanel.subtitle")}
      </div>
      <p>{t("downloadPanel.logInHint")}</p>
      <div className="download-panel__button-container">
        <Button
          className="download-panel__button"
          text={t("downloadPanel.logInButton")}
        />
      </div>
    </SidebarPanel>
  );
};

export default DownloadPanel;
