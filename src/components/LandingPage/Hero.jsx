import PropTypes from "prop-types";
import "../../assets/stylesheets/Hero.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  // const sliceClass = classNames("hero-slice", className);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

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
    <header className={"sliceClass"} data-testid="hero-slice">
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
            onClick={onClickPlausible("Start coding Python")}
          />
          <DesignSystemButton
            className="landing-page__button"
            href={`/${locale}/projects/blank-html-starter`}
            text={t("landingPage.html")}
            textAlways
            onClick={onClickPlausible("Start coding HTML/CSS")}
          />
        </div>
      </div>
    </header>
  );
};

Hero.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default Hero;
