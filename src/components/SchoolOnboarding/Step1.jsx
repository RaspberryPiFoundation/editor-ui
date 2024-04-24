import React from "react";
import { useTranslation } from "react-i18next";
import { Accordion } from "@raspberrypifoundation/design-system-react";
import TextWithBoldSpan from "./TextWithBoldSpan";

const Step1 = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="school-onboarding-form__step">
        {t("schoolOnboarding.steps.step1.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p>{t("schoolOnboarding.steps.step1.thingsToKnow")}</p>
        <ul>
          <li>
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.employee" />
          </li>
          <li>
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.owner" />
          </li>
          <li>
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.verification" />
          </li>
          <li>
            <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step1.email" />
          </li>
        </ul>
        {/* TODO: Add accordion here once it has been created */}
        {/* <Accordion
          id="accordion"
          title={t("schoolOnboarding.steps.step1.notSchoolQuestion")}
          content={t("schoolOnboarding.steps.step1.notSchoolAnswer")}
        /> */}
        <strong>{t("schoolOnboarding.steps.step1.notSchoolQuestion")}</strong>
        <p>{t("schoolOnboarding.steps.step1.notSchoolAnswer")}</p>
      </div>
    </>
  );
};

export default Step1;
