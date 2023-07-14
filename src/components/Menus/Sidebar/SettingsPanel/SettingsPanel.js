import React from "react";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";

import "./SettingsPanel.scss";

const SettingsPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("settingsPanel.info")}>
      <p>Madzia</p>
    </SidebarPanel>
  );
};

export default SettingsPanel;
