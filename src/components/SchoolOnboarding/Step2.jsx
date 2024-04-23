import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckboxInput } from "@raspberrypifoundation/design-system-react";
import TextWithBoldSpan from "./TextWithBoldSpan";
import TextWithLink from "./TextWithLink";

const Step2 = () => {
  const { t } = useTranslation();
  const schoolOnboardingData = JSON.parse(
    localStorage.getItem("schoolOnboarding"),
  );
  const [stepData, setStepData] = useState(
    schoolOnboardingData && schoolOnboardingData["step_2"]
      ? schoolOnboardingData["step_2"]
      : {},
  );

  const onChange = (e) => {
    const { name, checked } = e.target;
    setStepData((data) => ({ ...data, [name]: checked }));
  };

  useEffect(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("schoolOnboarding")),
        step_2: stepData,
      }),
    );
  }, [stepData]);

  return (
    <>
      <h3 className="school-onboarding-form__step">
        {t("schoolOnboarding.steps.step2.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p>
          <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step2.owner" />
        </p>
        <p>
          <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step2.responsibilities" />
        </p>
        <ul>
          <li>{t("schoolOnboarding.steps.step2.responsibility1")}</li>
          <li>{t("schoolOnboarding.steps.step2.responsibility2")}</li>
          <li>{t("schoolOnboarding.steps.step2.responsibility3")}</li>
          <li>{t("schoolOnboarding.steps.step2.responsibility4")}</li>
          <li>{t("schoolOnboarding.steps.step2.responsibility5")}</li>
        </ul>
        <p>
          <TextWithLink
            i18nKey="schoolOnboarding.steps.step2.termsAndConditions"
            to="/"
          />
        </p>
        <form>
          <div>
            <CheckboxInput
              label={t("schoolOnboarding.steps.step2.agreeAuthority")}
              name="authority"
              value="authority"
              onChange={onChange}
              checked={!!stepData["authority"]}
              error=""
            />
          </div>
          <div>
            <CheckboxInput
              label={
                <TextWithLink
                  i18nKey="schoolOnboarding.steps.step2.termsAndConditions"
                  to="/"
                />
              }
              name="responsibility"
              value="responsibility"
              onChange={onChange}
              checked={!!stepData["responsibility"]}
              error=""
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Step2;
