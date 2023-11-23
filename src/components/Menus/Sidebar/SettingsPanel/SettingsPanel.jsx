import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import FontSizeSelector from "./FontSizeSelector/FontSizeSelector";

import "../../../../assets/stylesheets/SettingsPanel.scss";

const SettingsPanel = () => {
  const { t } = useTranslation();
  const isThemeable = useSelector((state) => state.editor.isThemeable);

  return (
    <SidebarPanel heading={t("settingsPanel.info")}>
      <div className="settings-panel">
        {isThemeable && <ThemeToggle />}
        <FontSizeSelector />
      </div>
    </SidebarPanel>
  );
};

export default SettingsPanel;
