import React from "react";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";
import { Link } from "react-router-dom";

import "./InfoPanel.scss";

const InfoPanel = () => {
  const { t } = useTranslation();
  const links = [
    {
      id: "feedback",
      text: t("sidebar.feedback"),
      href: "/feedback",
    },
    {
      id: "privacy",
      text: t("sidebar.privacy"),
      href: "/privacy",
    },
    {
      id: "cookies",
      text: t("sidebar.cookies"),
      href: "/cookies",
    },
    {
      id: "accessibility",
      text: t("sidebar.accessibility"),
      href: "/accessibility",
    },
    {
      id: "safeguarding",
      text: t("sidebar.safeguarding"),
      href: "/safeguarding",
    },
  ];

  return (
    <SidebarPanel heading={t("infoPanel.info")}>
      <div className="info-panel">
        <p>{t("sidebar.information_text")}</p>
      </div>
      <div className="info-panel info-panel__links">
        {links.map((link, i) => (
          <Link key={i} className="info-panel__link" to={link.href}>
            {link.text}
          </Link>
        ))}
        <p>{t("sidebar.charity")}</p>
      </div>
    </SidebarPanel>
  );
};

export default InfoPanel;
