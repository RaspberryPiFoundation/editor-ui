import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

const SchoolOnboarding = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  return (
    <div className="school-onboarding-wrapper">
      <div className="school-onboarding__projects">
        <h1 className="school-onboarding__projects--title">
          {t("schoolOnboarding.title_1")}
        </h1>
        <h2 className="school-onboarding__projects--subtitle">
          {t("schoolOnboarding.title_2")}
        </h2>
        <div className="school-onboarding__projects--buttons">
          <DesignSystemButton
            className="school-onboarding__button"
            href={`/${locale}/projects/blank-python-starter`}
            text={t("schoolOnboarding.button_1")}
            textAlways
            onClick={onClickPlausible("Button text")}
          />
          <DesignSystemButton
            className="school-onboarding__button"
            href={`/${locale}/projects/blank-html-starter`}
            text={t("schoolOnboarding.button_2")}
            textAlways
            onClick={onClickPlausible("Button text")}
          />
        </div>
      </div>
      <p>School Onboarding</p>
    </div>
  );
};

export default SchoolOnboarding;
