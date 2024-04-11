import { useTranslation } from "react-i18next";

const Step4 = () => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step_4.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>Step 4</p>
      </div>
    </>
  )
}

export default Step4;
