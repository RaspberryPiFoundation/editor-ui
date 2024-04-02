import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/LandingPage.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { ReactComponent as HtmlFileIcon } from "../../assets/icons/html_file.svg";
import { ReactComponent as PythonFileIcon } from "../../assets/icons/python_file.svg";

const SchoolOnboarding = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* <div className="landing-page__projects">
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
      </div> */}
      <p>SchoolOnboarding</p>
    </div>
  );
};

export default SchoolOnboarding;
