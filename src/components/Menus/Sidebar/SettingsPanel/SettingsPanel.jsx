import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import FontSizeSelector from "./FontSizeSelector/FontSizeSelector";
import AiHintToggle from "./AiHintToggle/AiHintToggle";
import useAiHintAvailable from "../../../../hooks/useAiHintAvailable";

import "../../../../assets/stylesheets/SettingsPanel.scss?inline";

const SettingsPanel = () => {
  const { t } = useTranslation();
  const isThemeable = useSelector((state) => state.editor.isThemeable);
  const aiHintAvailable = useAiHintAvailable();

  return (
    <SidebarPanel heading={t("settingsPanel.info")}>
      <div className="settings-panel">
        {isThemeable && (
          <div className="settings-panel__theme">
            <ThemeToggle />
          </div>
        )}
        <div className="settings-panel__text-size">
          <FontSizeSelector />
        </div>
        {aiHintAvailable && (
          <div className="settings-panel__ai-hint-toggle">
            <AiHintToggle />
          </div>
        )}
      </div>
    </SidebarPanel>
  );
};

export default SettingsPanel;
