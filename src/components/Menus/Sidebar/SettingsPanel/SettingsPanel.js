import React from "react";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import FontSizeSelector from "./FontSizeSelector/FontSizeSelector";

import "./SettingsPanel.scss";

const SettingsPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("settingsPanel.info")}>
      <div className="settings-panel">
        <h3>Theme</h3>
        <ThemeToggle />
        <h3>{t("sidebar.settingsMenu.textSize")}</h3>
        <FontSizeSelector />
      </div>
    </SidebarPanel>
  );
};

export default SettingsPanel;
