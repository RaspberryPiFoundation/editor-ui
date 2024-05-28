import React from "react";
// TODO: Reinstate "Log in as a student" button for full launch
// import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import EditorBrand from "../EducationLogo/EducationLogo";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import hero from "../../assets/images/education/hero.jpg";

import "../../assets/stylesheets/Hero.scss";

const Hero = () => {
  // TODO: Reinstate "Log in as a student" button for full launch
  // const user = useSelector((state) => state.auth.user);
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
          <h1 className="hero__copy--title">
            {t("educationLandingPage.hero.title")}
          </h1>
          <h2 className="hero__copy--subtitle">
            {t("educationLandingPage.hero.subtitle")}
          </h2>
          <div className="hero__buttons">
            <DesignSystemButton
              className=""
              href={`/`}
              text={t("educationLandingPage.hero.createSchool")}
              textAlways
              onClick={onClickPlausible("Create a School")}
            />
            {/* TODO: Reinstate "Log in as a student" button for full launch */}
            {/* {!user && (
              <DesignSystemButton
                className=""
                href={`/`}
                text={t("educationLandingPage.hero.logIn")}
                textAlways
                onClick={onClickPlausible("Log in as a student")}
                type={"secondary"}
              />
            )} */}
          </div>
        </div>
        <div className="hero__image">
          <img alt={t("educationLandingPage.hero.imageAlt")} src={hero} />
        </div>
      </header>
    </div>
  );
};

export default Hero;
