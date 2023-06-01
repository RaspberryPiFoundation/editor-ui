import React from "react";
import { useTranslation } from "react-i18next";
import "./LandingPage.scss";

import Button from "../Button/Button";
import startIcon from "../../assets/start_icon.svg";
import { FileIconHtml } from "../../Icons";
import { FileIconPython } from "../../Icons";

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
        <Button
          buttonText={t("landingPage.python")}
          ButtonIcon={FileIconPython}
          onclick="location.href='https://google.com';"
          className="btn--primary btn--small landing-page-button"
        />
        <Button
          buttonText={t("landingPage.html")}
          ButtonIcon={FileIconHtml}
          onclick="location.href='https://google.com';"
          className="btn--primary btn--small landing-page-button"
        />
        <p className="landing-page__projects--login">
          {t("landingPage.login")}
        </p>
      </div>
      <div className="landing-page__paths">
        <h2 className="landing-page__paths--title">{t("landingPage.start")}</h2>
        <p className="landing-page__paths--description">
          {t("landingPage.projects")}
        </p>
        <img className="" src={startIcon} alt={""} />
      </div>
    </div>
  );
};

export default LandingPage;
