import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditorBrand from "../EditorBrand/EditorBrand";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import heroPlaceholder from "../../assets/images/hero-placeholder.svg";

import "../../assets/stylesheets/Hero.scss";

const Hero = () => {
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
    <div className="hero__wrapper">
      <EditorBrand />
      <header className="hero" data-testid="hero-slice">
        <div className="hero__copy">
          <h1 className="hero__copy--title">{t("landingPage.hero.title")}</h1>
          <h2 className="hero__copy--subtitle">
            {t("landingPage.hero.subtitle")}
          </h2>
          <div className="hero__buttons">
            <DesignSystemButton
              className=""
              href={`/${locale}/projects/blank-python-starter`}
              text={t("landingPage.hero.createSchool")}
              textAlways
              onClick={onClickPlausible("Create a School")}
            />
            <DesignSystemButton
              className=""
              href={`/${locale}/projects/blank-html-starter`}
              text={t("landingPage.hero.logIn")}
              textAlways
              onClick={onClickPlausible("Log in as a student")}
              type={"secondary"}
            />
          </div>
        </div>
        <div className="hero__image">
          <img alt="" src={heroPlaceholder} />
        </div>
      </header>
    </div>
  );
};

export default Hero;
