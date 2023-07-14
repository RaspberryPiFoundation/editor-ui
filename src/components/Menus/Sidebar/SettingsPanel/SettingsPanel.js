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
      <div className="settings-nanel">
        {/* <div className="settings-panel__theme">Theme</div>
        <div className="settings-panel__font">Font size</div> */}
        <div className="settings-menu__font-size">
          <h3>{t("header.settingsMenu.textSize")}</h3>
          <FontSizeSelector />
        </div>
        <div className="settings-menu__theme">
          <h3>{t("header.settingsMenu.theme")}</h3>
          <ThemeToggle />
        </div>
      </div>
    </SidebarPanel>
  );
};

export default SettingsPanel;
