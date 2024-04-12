import { useTranslation } from "react-i18next";

const Step3 = () => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step_3.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>Step 3</p>
      </div>
    </>
  );
};

export default Step3;
