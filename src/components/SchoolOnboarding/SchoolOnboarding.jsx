import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import LineIcon from "../../assets/icons/line.svg";
import MultiStepForm from "./MultistepForm";

const SchoolOnboarding = () => {
  const { t } = useTranslation();

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
      <MultiStepForm/>
    </div>
  );
};

export default SchoolOnboarding;
