import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/LandingPage.scss";
import LoginButton from "../Login/LoginButton";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import startIconDark from "../../assets/start_icon_dark.svg";
import startIconLight from "../../assets/start_icon_light.svg";
import { ReactComponent as HtmlFileIcon } from "../../assets/icons/html_file.svg";
import { ReactComponent as PythonFileIcon } from "../../assets/icons/python_file.svg";

const LandingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  const [cookies] = useCookies(["theme"]);
  const locale = i18n.language;
  const isDarkMode =
    cookies.theme === "dark" ||
    (!cookies.theme &&
      window.matchMedia("(prefers-color-scheme:dark)").matches);

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(`/${locale}/projects`);
    }
  }, [user, locale, navigate]);

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
          <DesignSystemButton
            className="landing-page__button"
            href={`/${locale}/projects/blank-python-starter`}
            text={t("landingPage.python")}
            textAlways
            icon={<PythonFileIcon />}
            onClick={onClickPlausible("Start coding Python")}
          />
          <DesignSystemButton
            className="landing-page__button"
            href={`/${locale}/projects/blank-html-starter`}
            text={t("landingPage.html")}
            textAlways
            icon={<HtmlFileIcon />}
            onClick={onClickPlausible("Start coding HTML/CSS")}
          />
        </div>
        <p className="landing-page__projects--login">
          Have an account?
          <LoginButton
            key="login"
            className=""
            buttonText={t("landingPage.login")}
            loginRedirect={`/${locale}/projects`}
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
            Follow a{" "}
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
        <div className="landing-page__paths-media">
          <img src={isDarkMode ? startIconDark : startIconLight} alt={""} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
