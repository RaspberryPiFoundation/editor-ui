import React from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "./LandingPage.scss";
import "../Button/Button.scss";
import LoginButton from "../Login/LoginButton";
//import Button from "../Button/Button";
import { Button } from "@RaspberryPiFoundation/design-system-react/";
import startIconDark from "../../assets/start_icon_dark.svg";
import startIconLight from "../../assets/start_icon_light.svg";
import { FileIconHtml, FileIconPython } from "../../Icons";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [cookies] = useCookies(["theme"]);
  const locale = i18n.language;
  const isDarkMode =
    cookies.theme === "dark" ||
    (!cookies.theme &&
      window.matchMedia("(prefers-color-scheme:dark)").matches);
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
            className="rpf-button--primary"
            href={`/${locale}/projects/blank-python-starter`}
            text={t("landingPage.python")}
            // icon={FileIconPython}
          />
          <Button
            className="rpf-button"
            href={`/${locale}/projects/blank-html-starter`}
            text={t("landingPage.html")}
            // icon={FileIconHtml}
          />
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
