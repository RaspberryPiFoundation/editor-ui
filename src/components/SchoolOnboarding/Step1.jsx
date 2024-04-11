import { useTranslation } from "react-i18next";

const Step1 = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step_1.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>{t("schoolOnboarding.steps.step_1.things_to_know")}</p>
        <ul>
          <li>{t("schoolOnboarding.steps.step_1.employee")}</li>
          <li>{t("schoolOnboarding.steps.step_1.owner")}</li>
          <li>{t("schoolOnboarding.steps.step_1.verification")}</li>
          <li>{t("schoolOnboarding.steps.step_1.email")}</li>
        </ul>
        {/* TODO: Add accordion here once it has been created */}
        <strong>{t("schoolOnboarding.steps.step_1.not_school_question")}</strong>
        <p>{t("schoolOnboarding.steps.step_1.not_school_answer")}</p>
      </div>
    </>
  )
}

export default Step1;
