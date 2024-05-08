import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckboxInput,
  Alert,
} from "@raspberrypifoundation/design-system-react";
import TextWithBoldSpan from "./TextWithBoldSpan";
import TextWithLink from "./TextWithLink";
import { fieldError, existsValidation } from "../../utils/fieldValidation";

const Step2 = ({ stepIsValid = true, showInvalidFields = true }) => {
  const { t } = useTranslation();
  const schoolOnboardingData = JSON.parse(
    localStorage.getItem("schoolOnboarding"),
  );
  const [stepData, setStepData] = useState(
    schoolOnboardingData && schoolOnboardingData["step_2"]
      ? schoolOnboardingData["step_2"]
      : {},
  );
  const [errors, setErrors] = useState([]);

  const onChange = (e) => {
    const { name, checked } = e.target;
    setStepData((data) => ({ ...data, [name]: checked }));
  };

  useEffect(() => {
    const errorList = [];

    const validations = [
      () => existsValidation({ stepData, fieldName: "authority" }),
      () => existsValidation({ stepData, fieldName: "responsibility" }),
    ];

    validations.forEach((runValidation) => {
      const validationResult = runValidation();
      if (validationResult) errorList.push(validationResult);
    });

    setErrors(errorList);
  }, [stepData]);

  useEffect(() => {
    stepIsValid(errors.length === 0);
  }, [stepData, errors, stepIsValid]);

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
      <h3 className="school-onboarding-form__title">
        {t("schoolOnboarding.steps.step2.title")}
      </h3>
      <div className="school-onboarding-form__content">
        {showInvalidFields && errors.length > 0 && (
          <Alert
            title={t("schoolOnboarding.errorTitle")}
            type="error"
            text={t("schoolOnboarding.steps.step2.validation.errors.message")}
          />
        )}
        <p className="school-onboarding-form__text">
          <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step2.owner" />
        </p>
        <p className="school-onboarding-form__text">
          <TextWithBoldSpan i18nKey="schoolOnboarding.steps.step2.responsibilities" />
        </p>
        <ul className="school-onboarding-form__list">
          <li className="school-onboarding-form__list-item">
            {t("schoolOnboarding.steps.step2.responsibility1")}
          </li>
          <li className="school-onboarding-form__list-item">
            {t("schoolOnboarding.steps.step2.responsibility2")}
          </li>
          <li className="school-onboarding-form__list-item">
            {t("schoolOnboarding.steps.step2.responsibility3")}
          </li>
          <li className="school-onboarding-form__list-item">
            {t("schoolOnboarding.steps.step2.responsibility4")}
          </li>
          <li className="school-onboarding-form__list-item">
            {t("schoolOnboarding.steps.step2.responsibility5")}
          </li>
        </ul>
        <p className="school-onboarding-form__text">
          <TextWithLink
            i18nKey="schoolOnboarding.steps.step2.termsAndConditions"
            to="/"
          />
        </p>
        <form>
          <CheckboxInput
            id="authority"
            label={t("schoolOnboarding.steps.step2.agreeAuthority")}
            name="authority"
            value="authority"
            onChange={onChange}
            checked={!!stepData["authority"]}
            error={
              showInvalidFields &&
              fieldError({
                errors,
                fieldName: "authority",
                errorMessage: t(
                  "schoolOnboarding.steps.step2.validation.errors.authority",
                ),
              })
            }
          />
          <CheckboxInput
            id="responsibility"
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
              showInvalidFields &&
              fieldError({
                errors,
                fieldName: "responsibility",
                errorMessage: t(
                  "schoolOnboarding.steps.step2.validation.errors.responsibility",
                ),
              })
            }
          />
        </form>
      </div>
    </>
  );
};

export default Step2;
