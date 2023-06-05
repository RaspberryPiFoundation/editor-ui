import React from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
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
        <div className="landing-page__projects--buttons">
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
        </div>
        <p className="landing-page__projects--login">
          <Trans i18nKey="login">
            Have an account?
            <Link to="raspberrypi.org">{t("landingPage.login")}</Link> and
            continue your projects.
          </Trans>
        </p>
      </div>
      <div className="landing-page__paths">
        <div className="landing-page__paths-copy">
          <h2 className="landing-page__paths--title">
            {t("landingPage.start")}
          </h2>
          <p className="landing-page__paths--description">
            <Trans i18nKey="projectPython">
              Follow a
              <Link to="raspberrypi.org">{t("landingPage.projectPython")}</Link>{" "}
              or{" "}
              <Link to="raspberrypi.org">{t("landingPage.projectHtml")}</Link>{" "}
              on our Projects site.
            </Trans>
          </p>
        </div>
        <img className="" src={startIcon} alt={""} />
      </div>
    </div>
  );
};

export default LandingPage;
