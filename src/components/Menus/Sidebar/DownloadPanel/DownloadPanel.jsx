import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";

export const DownloadPanel = () => {
  const { t } = useTranslation();

  return <SidebarPanel heading={t("downloadPanel.heading")} />;
};

export default DownloadPanel;
