import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./LandingPage.scss";
import LoginButton from "../Login/LoginButton";
import Button from "../Button/Button";
import startIcon from "../../assets/start_icon.svg";
import { FileIconHtml, FileIconPython } from "../../Icons";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
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
          <Link
            to={`${locale}/projects/blank-python-starter`}
            className="project-gallery-link btn--primary  landing-page-button"
          >
            {
              <>
                <FileIconPython />
                <span className="editor-header__text">
                  {t("landingPage.html")}
                </span>
              </>
            }
          </Link>
          <Link
            to={`${locale}/projects/blank-html-starter`}
            className="project-gallery-link btn--primary  landing-page-button"
          >
            {
              <>
                <FileIconHtml />
                <span className="editor-header__text">
                  {t("landingPage.html")}
                </span>
              </>
            }
          </Link>
        </div>
        <p className="landing-page__projects--login">
          Have an account?
          <LoginButton
            key="login"
            className=""
            buttonText={t("landingPage.login")}
          />
          and continue your projects
        </p>
      </div>
      <div className="landing-page__paths">
        <div className="landing-page__paths-copy">
          <h2 className="landing-page__paths--title">
            {t("landingPage.start")}
          </h2>
          <p className="landing-page__paths--description">
            Follow a
            <Link
              className="landing-page__link"
              to="https://projects.raspberrypi.org/en/pathways/python-intro"
            >
              {t("landingPage.projectPython")}
            </Link>{" "}
            or{" "}
            <Link
              className="landing-page__link"
              to="https://projects.raspberrypi.org/en/pathways/web-intro"
            >
              {t("landingPage.projectHtml")}
            </Link>{" "}
            on our Projects site.
          </p>
        </div>
        <img className="" src={startIcon} alt={""} />
        <Button
          className="btn--primary"
          buttonHref={"https://projects.raspberrypi.org/en/pathways/web-intro"}
          buttonText={t("landingPage.html")}
          ButtonIcon={FileIconHtml}
        />
      </div>
    </div>
  );
};

export default LandingPage;
