import React from "react";
import SidebarPanel from "../SidebarPanel";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

const InfoPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("infoPanel.info")}>
      <div className="editor-info ">
        <p>{t("sidebar.information_text")}</p>
      </div>
      <div className="editor-info">
        <Link className="editor-info__link">{t("sidebar.feedback")}</Link>
        <Link className="editor-info__link">{t("sidebar.privacy")}</Link>
        <Link className="editor-info__link">{t("sidebar.cookies")}</Link>
        <Link className="editor-info__link">{t("sidebar.accessibility")}</Link>
        <Link className="editor-info__link">{t("sidebar.safeguarding")}</Link>

        <p>{t("sidebar.charity")}</p>
      </div>
    </SidebarPanel>
  );
};

export default InfoPanel;
