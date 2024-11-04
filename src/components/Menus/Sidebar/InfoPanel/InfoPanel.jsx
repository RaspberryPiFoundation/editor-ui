import React from "react";
import { useTranslation } from "react-i18next";
import SidebarPanel from "../SidebarPanel";

import "../../../../assets/stylesheets/InfoPanel.scss";

const InfoPanel = () => {
  const { t } = useTranslation();
  const links = [
    {
      id: "help",
      text: t("sidebar.help"),
      href: "https://help.editor.raspberrypi.org/hc/en-us",
    },
    {
      id: "feedback",
      text: t("sidebar.feedback"),
      href: "https://form.raspberrypi.org/f/code-editor-feedback",
    },
    {
      id: "privacy",
      text: t("sidebar.privacy"),
      href: "https://www.raspberrypi.org/privacy/child-friendly/",
    },
    {
      id: "cookies",
      text: t("sidebar.cookies"),
      href: "https://www.raspberrypi.org/cookies/",
    },
    {
      id: "accessibility",
      text: t("sidebar.accessibility"),
      href: "https://www.raspberrypi.org/accessibility/",
    },
    {
      id: "safeguarding",
      text: t("sidebar.safeguarding"),
      href: "https://www.raspberrypi.org/safeguarding/",
    },
  ];

  return (
    <SidebarPanel heading={t("infoPanel.info")}>
      <div className="info-panel">
        <p>{t("sidebar.information_text")}</p>
      </div>
      <div className="info-panel info-panel__links">
        {links.map((link, i) => (
          <a
            key={i}
            className="info-panel__link"
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.text}
          </a>
        ))}
        <p>{t("sidebar.charity")}</p>
      </div>
    </SidebarPanel>
  );
};

export default InfoPanel;
