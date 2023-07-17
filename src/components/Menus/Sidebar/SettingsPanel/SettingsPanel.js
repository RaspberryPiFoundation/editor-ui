import React from "react";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import FontSizeSelector from "../../../Editor/FontSizeSelector/FontSizeSelector";

import "./SettingsPanel.scss";

const SettingsPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("settingsPanel.info")}>
      <div className="settings-panel">
        <h2>Theme</h2>
        <ThemeToggle />
        <h2>{t("sidebar.settingsMenu.textSize")}</h2>
        <FontSizeSelector />
      </div>
    </SidebarPanel>
  );
};

export default SettingsPanel;
