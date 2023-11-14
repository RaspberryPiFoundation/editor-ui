import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";

import "../../../../assets/stylesheets/DownloadPanel.scss";

export const DownloadPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("downloadPanel.heading")}>
      <div className="download-panel__subtitle">
        {t("downloadPanel.subtitle")}
      </div>
    </SidebarPanel>
  );
};

export default DownloadPanel;
