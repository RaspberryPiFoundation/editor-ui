import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import LineIcon from "../../assets/icons/line.svg";

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
      <div className="school-onboarding__modal--text">
        <h2 className="school-onboarding__modal--title">
          {t("schoolOnboarding.title_1")}
        </h2>
        <img src={LineIcon} alt="" />
        <h2 className="school-onboarding__modal--subtitle">
          {t("schoolOnboarding.title_2")}
        </h2>
      </div>
      <div className="school-onboarding__modal">
        <span className="school-onboarding__modal-steps">
          {t("schoolOnboarding.steps")}
        </span>
        <h3 className="school-onboarding__modal-step">
          {t("schoolOnboarding.step")}
        </h3>
        <section className="grey__section"></section>
        <div className="school-onboarding__modal--buttons">
          <DesignSystemButton
            className="school-onboarding__button"
            href={`/${locale}/`}
            text={t("schoolOnboarding.button_1")}
            textAlways
            onClick={onClickPlausible("Button text")}
            type={"secondary"}
          />
          <DesignSystemButton
            className="school-onboarding__button"
            href={`/${locale}/r`}
            text={t("schoolOnboarding.button_2")}
            textAlways
            onClick={onClickPlausible("Button text")}
          />
        </div>
      </div>
    </div>
  );
};

export default SchoolOnboarding;
