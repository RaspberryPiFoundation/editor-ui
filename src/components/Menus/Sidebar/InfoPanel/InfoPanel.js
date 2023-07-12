import React from "react";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";
import { Link } from "react-router-dom";

import "./InfoPanel.scss";

const InfoPanel = () => {
  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("infoPanel.info")}>
      <div className="info-panel">
        <p>{t("sidebar.information_text")}</p>
      </div>
      <div className="info-panel info-panel__links">
        <Link className="info-panel__link" to="/">
          {t("sidebar.feedback")}
        </Link>
        <Link className="info-panel__link" to="/">
          {t("sidebar.privacy")}
        </Link>
        <Link className="info-panel__link" to="/">
          {t("sidebar.cookies")}
        </Link>
        <Link className="info-panel__link" to="/">
          {t("sidebar.accessibility")}
        </Link>
        <Link className="info-panel__link" to="/">
          {t("sidebar.safeguarding")}
        </Link>

        <p>{t("sidebar.charity")}</p>
      </div>
    </SidebarPanel>
  );
};

export default InfoPanel;
