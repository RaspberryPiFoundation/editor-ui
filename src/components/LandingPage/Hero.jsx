import PropTypes from "prop-types";
import "../../assets/stylesheets/Hero.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditorBrand from "../EditorBrand/EditorBrand";
import heroPlaceholder from "../../assets/images/hero-placeholder.svg";

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
    <header className={"header__wrapper"} data-testid="hero-slice">
      <EditorBrand />
      <div className="header__copy">
        <h1 className="">{t("landingPage.hero.title")}</h1>
        <h2 className="">{t("landingPage.hero.subtitle")}</h2>
        <div className="hero__buttons">
          <DesignSystemButton
            className=""
            href={`/${locale}/projects/blank-python-starter`}
            text={t("landingPage.hero.createSchool")}
            textAlways
            onClick={onClickPlausible("Start coding Python")}
          />
          <DesignSystemButton
            className=""
            href={`/${locale}/projects/blank-html-starter`}
            text={t("landingPage.hero.logIn")}
            textAlways
            onClick={onClickPlausible("Start coding HTML/CSS")}
            type={"secondary"}
          />
        </div>
      </div>
      <div className="header__image">
        <img alt="" src={heroPlaceholder} />
      </div>
    </header>
  );
};

Hero.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default Hero;
