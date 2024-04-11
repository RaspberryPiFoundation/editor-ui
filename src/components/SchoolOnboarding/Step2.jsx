import { useTranslation } from "react-i18next";

const Step2 = () => {
  const { t } = useTranslation();
  const schoolOnboardingData = JSON.parse(localStorage.getItem("schoolOnboarding"));

  const onChange = (e) => {
    const { name, checked } = e.target;
    localStorage.setItem("schoolOnboarding", JSON.stringify({...schoolOnboardingData, step_2: { ...schoolOnboardingData["step_2"], [name]: checked}}));
  }

  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step_2.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>{t("schoolOnboarding.steps.step_2.owner")}</p>
        <p>{t("schoolOnboarding.steps.step_2.responsibilities")}</p>
        <ul>
          <li>{t("schoolOnboarding.steps.step_2.responsibility_1")}</li>
          <li>{t("schoolOnboarding.steps.step_2.responsibility_2")}</li>
          <li>{t("schoolOnboarding.steps.step_2.responsibility_3")}</li>
          <li>{t("schoolOnboarding.steps.step_2.responsibility_4")}</li>
        </ul>
        <p>{t("schoolOnboarding.steps.step_2.terms_and_conditions")}</p>
        <form>
          <div>
            <label>
              <input type="checkbox" id="authority" name="authority" value="authority" onChange={onChange} />
              {t("schoolOnboarding.steps.step_2.agree_authority")}
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" id="responsibility" name="responsibility" value="responsibility" onChange={onChange} />
              {t("schoolOnboarding.steps.step_2.agree_responsibility")}
            </label>
          </div>
        </form>
      </div>
    </>
  )
}

export default Step2;
