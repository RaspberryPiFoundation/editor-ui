import { useTranslation } from "react-i18next";

const Step1 = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step1.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>{t("schoolOnboarding.steps.step1.thingsToKnow")}</p>
        <ul>
          <li>{t("schoolOnboarding.steps.step1.employee")}</li>
          <li>{t("schoolOnboarding.steps.step1.owner")}</li>
          <li>{t("schoolOnboarding.steps.step1.verification")}</li>
          <li>{t("schoolOnboarding.steps.step1.email")}</li>
        </ul>
        {/* TODO: Add accordion here once it has been created */}
        <strong>
          {t("schoolOnboarding.steps.step1.notSchoolQuestion")}
        </strong>
        <p>{t("schoolOnboarding.steps.step1.notSchoolAnswer")}</p>
      </div>
    </>
  );
};

export default Step1;
