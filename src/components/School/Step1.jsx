import React from "react";
import { useTranslation } from "react-i18next";
import { Accordion } from "@raspberrypifoundation/design-system-react";
import TextWithBoldSpan from "../SchoolOnboarding/TextWithBoldSpan";

const Step1 = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="school-onboarding-form__title">
        {t("schoolOnboarding.steps.step1.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p className="school-onboarding-form__text">
          {t("schoolOnboarding.steps.step1.thingsToKnow")}
        </p>
        <ul className="school-onboarding-form__list">
          <li className="school-onboarding-form__list-item">
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.employee" />
          </li>
          <li className="school-onboarding-form__list-item">
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.owner" />
          </li>
          <li className="school-onboarding-form__list-item">
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.verification" />
          </li>
          <li className="school-onboarding-form__list-item">
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.email" />
          </li>
        </ul>
        <Accordion
          id="accordion"
          title={t("schoolOnboarding.steps.step1.notSchoolQuestion")}
          content={t("schoolOnboarding.steps.step1.notSchoolAnswer")}
        />
      </div>
    </>
  );
};

export default Step1;
