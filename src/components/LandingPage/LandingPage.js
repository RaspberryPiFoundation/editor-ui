import React from "react";
import { useTranslation } from "react-i18next";
import "./LandingPage.scss";

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="landing-page-wrapper">
      <h1>{t("landingPage.title")}</h1>
      <h2>{t("landingPage.subtitle")}</h2>
      <button>Python</button>
      <button>Html</button>
      <p>{t("landingPage.login")}</p>
      <p>{t("landingPage.start")}</p>
      <p>{t("landingPage.projects")}</p>
    </div>
  );
};

export default LandingPage;
