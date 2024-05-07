import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import EditorBrand from "../LogoLM/LogoLM";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import hero from "../../assets/images/hero.jpg";

import "../../assets/stylesheets/Hero.scss";

const Hero = () => {
  const user = useSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  return (
    <div className="hero__wrapper">
      <header className="hero" data-testid="hero-slice">
        <div className="hero__copy">
          <EditorBrand />
          <h1 className="hero__copy--title">{t("landingPage.hero.title")}</h1>
          <h2 className="hero__copy--subtitle">
            {t("landingPage.hero.subtitle")}
          </h2>
          <div className="hero__buttons">
            <DesignSystemButton
              className=""
              href={`/`}
              text={t("landingPage.hero.createSchool")}
              textAlways
              onClick={onClickPlausible("Create a School")}
            />
            {!user && (
              <DesignSystemButton
                className=""
                href={`/`}
                text={t("landingPage.hero.logIn")}
                textAlways
                onClick={onClickPlausible("Log in as a student")}
                type={"secondary"}
              />
            )}
          </div>
        </div>
        <div className="hero__image">
          <img alt="" src={hero} />
        </div>
      </header>
    </div>
  );
};

export default Hero;
