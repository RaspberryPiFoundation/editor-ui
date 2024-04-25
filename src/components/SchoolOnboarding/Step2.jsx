import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckboxInput,
  Alert,
} from "@raspberrypifoundation/design-system-react";
import TextWithBoldSpan from "./TextWithBoldSpan";
import TextWithLink from "./TextWithLink";

const Step2 = ({ validationCallback, errorFields }) => {
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

  const stepErrors = () => {
    const errors = [];

    if (!stepData["responsibility"]) errors.push("responsibility");
    if (!stepData["authority"]) errors.push("authority");

    return errors;
  };

  useEffect(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("schoolOnboarding")),
        step_2: stepData,
      }),
    );

    validationCallback(stepErrors());
  }, [stepData]);

  return (
    <>
      <h3 className="school-onboarding-form__step">
        {t("schoolOnboarding.steps.step2.title")}
      </h3>
      <div className="school-onboarding-form__content">
        {errorFields.length > 0 && (
          <Alert
            title={t("schoolOnboarding.errorTitle")}
            type="error"
            text={t("schoolOnboarding.steps.step2.validation.error")}
          />
        )}
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
              error={
                errorFields.some((field) => field === "authority") &&
                "You must confirm you have authority"
              }
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
              error={
                errorFields.some((field) => field === "responsibility") &&
                "You must confirm you accept responsibility"
              }
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Step2;
