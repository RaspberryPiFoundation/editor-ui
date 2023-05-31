import React from "react";
import { useTranslation } from "react-i18next";
import "./LandingPage.scss";

import startIcon from "../../assets/start_icon.svg";
const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="landing-page-wrapper">
      <div className="landing-page__projects">
        <h1 className="landing-page__projects--title">
          {t("landingPage.title")}
        </h1>
        <h2 className="landing-page__projects--subtitle">
          {t("landingPage.subtitle")}
        </h2>
        <button className="btn btn--primary">{t("landingPage.python")}</button>
        <button className="btn btn--primary">{t("landingPage.html")}</button>
        <p>{t("landingPage.login")}</p>
      </div>
      <div className="landing-page__paths">
        <p>{t("landingPage.start")}</p>
        <p>{t("landingPage.projects")}</p>
        <img className="" src={startIcon} alt={""} />
      </div>
    </div>
  );
};

export default LandingPage;
