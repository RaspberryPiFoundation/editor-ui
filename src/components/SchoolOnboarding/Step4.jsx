import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SelectInput,
  TextInput,
  Alert,
} from "@raspberrypifoundation/design-system-react";
import TextWithLink from "./TextWithLink";
import {
  fieldError,
  existsValidation,
  urlValidation,
} from "../../utils/fieldValidation";

const Step4 = ({ stepIsValid, showInvalidFields, apiErrors }) => {
  const { t } = useTranslation();
  const schoolOnboardingData = JSON.parse(
    localStorage.getItem("schoolOnboarding"),
  );
  const [stepData, setStepData] = useState(
    schoolOnboardingData && schoolOnboardingData["step_4"]
      ? schoolOnboardingData["step_4"]
      : {
          name: "",
          website: "",
          address_line_1: "",
          address_line_2: "",
          municipality: "",
          administrative_area: "",
          postal_code: "",
          country_code: "",
          reference: "",
        },
  );
  const [errors, setErrors] = useState([]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setStepData((data) => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    const errorList = [];
    const validations = [
      () => existsValidation({ stepData, fieldName: "name" }),
      () => urlValidation({ stepData, fieldName: "website" }),
      () => existsValidation({ stepData, fieldName: "address_line_1" }),
      () => existsValidation({ stepData, fieldName: "municipality" }),
      () => existsValidation({ stepData, fieldName: "administrative_area" }),
      () => existsValidation({ stepData, fieldName: "postal_code" }),
      () => existsValidation({ stepData, fieldName: "country_code" }),
    ];

    validations.forEach((runValidation) => {
      const validationResult = runValidation();
      if (validationResult) errorList.push(validationResult);
    });

    // Get the API errors that match the fields for this step
    const validationApiErrors = Object.keys(apiErrors).filter((key) =>
      stepData.hasOwnProperty(key),
    );

    errorList.push(...validationApiErrors);

    setErrors(errorList);
  }, [stepData, apiErrors]);

  useEffect(() => {
    stepIsValid(errors.length === 0);
  }, [stepData, errors, stepIsValid]);

  useEffect(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("schoolOnboarding")),
        step_4: stepData,
      }),
    );
  }, [stepData]);

  // Get the API errors that don't match the fields for this step
  const generalApiErrors = Object.keys(apiErrors).filter(
    (key) => !stepData.hasOwnProperty(key),
  );

  // Get the error string
  const findApiError = (field) =>
    apiErrors.hasOwnProperty(field) ? apiErrors[field]?.join(", ") : null;

  return (
    <>
      <h3 className="school-onboarding-form__title">
        {t("schoolOnboarding.steps.step4.title")}
      </h3>
      <div className="school-onboarding-form__content">
        {generalApiErrors.map((v, k) => (
          <Alert
            key={k}
            title={t("schoolOnboarding.apiErrorTitle")}
            type="error"
            text={`${v} ${findApiError(v)}`}
          />
        ))}
        {showInvalidFields && errors.length > 0 && (
          <Alert
            title={t("schoolOnboarding.errorTitle")}
            type="error"
            text={t("schoolOnboarding.steps.step4.validation.errors.message")}
          />
        )}

        <p className="school-onboarding-form__text">
          {t("schoolOnboarding.steps.step4.schoolDetails")}
        </p>

        <form>
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolName")}
            id="name"
            name="name"
            value={stepData["name"]}
            onChange={onChange}
            fullWidth={true}
            error={
              showInvalidFields &&
              fieldError({
                errors,
                fieldName: "name",
                errorMessage: t(
                  "schoolOnboarding.steps.step4.validation.errors.schoolName",
                ),
              })
            }
          />
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolWebsite")}
            id="website"
            name="website"
            value={stepData["website"]}
            onChange={onChange}
            fullWidth={true}
            error={
              showInvalidFields &&
              fieldError({
                errors,
                fieldName: "website",
                errorMessage: t(
                  "schoolOnboarding.steps.step4.validation.errors.schoolWebsite",
                ),
              })
            }
          />
          <section className="school-onboarding-form__section">
            <h4 className="school-onboarding-form__subtitle">
              {t("schoolOnboarding.steps.step4.schoolAddress")}
            </h4>
            <TextInput
              label={t("schoolOnboarding.steps.step4.schoolAddress1")}
              id="address_line_1"
              name="address_line_1"
              value={stepData["address_line_1"]}
              onChange={onChange}
              fullWidth={true}
              error={
                showInvalidFields &&
                fieldError({
                  errors,
                  fieldName: "address_line_1",
                  errorMessage: t(
                    "schoolOnboarding.steps.step4.validation.errors.schoolAddress1",
                  ),
                })
              }
            />
            <TextInput
              label={t("schoolOnboarding.steps.step4.schoolAddress2")}
              id="address_line_2"
              name="address_line_2"
              value={stepData["address_line_2"]}
              onChange={onChange}
              fullWidth={true}
            />
            <TextInput
              label={t("schoolOnboarding.steps.step4.schoolCity")}
              id="municipality"
              name="municipality"
              value={stepData["municipality"]}
              onChange={onChange}
              fullWidth={true}
              error={
                showInvalidFields &&
                fieldError({
                  errors,
                  fieldName: "municipality",
                  errorMessage: t(
                    "schoolOnboarding.steps.step4.validation.errors.schoolCity",
                  ),
                })
              }
            />
            <TextInput
              label={t("schoolOnboarding.steps.step4.schoolState")}
              id="administrative_area"
              name="administrative_area"
              value={stepData["administrative_area"]}
              onChange={onChange}
              fullWidth={true}
              error={
                showInvalidFields &&
                fieldError({
                  errors,
                  fieldName: "administrative_area",
                  errorMessage: t(
                    "schoolOnboarding.steps.step4.validation.errors.schoolState",
                  ),
                })
              }
            />
            <TextInput
              label={t("schoolOnboarding.steps.step4.schoolPostcode")}
              id="postal_code"
              name="postal_code"
              value={stepData["postal_code"]}
              onChange={onChange}
              fullWidth={true}
              error={
                showInvalidFields &&
                fieldError({
                  errors,
                  fieldName: "postal_code",
                  errorMessage: t(
                    "schoolOnboarding.steps.step4.validation.errors.schoolPostcode",
                  ),
                })
              }
            />
            <SelectInput
              label={t("schoolOnboarding.steps.step4.schoolCountry")}
              placeholder={t("schoolOnboarding.steps.step4.select")}
              options={[
                {
                  key: "IN",
                  value: "India",
                },
                {
                  key: "KE",
                  value: "Kenya",
                },
                {
                  key: "GB",
                  value: "United Kingdom",
                },
                {
                  key: "US",
                  value: "United States of America",
                },
              ]}
              id="country_code"
              name="country_code"
              onChange={onChange}
              value={stepData["country_code"]}
              fullWidth={true}
              error={
                showInvalidFields &&
                fieldError({
                  errors,
                  fieldName: "country_code",
                  errorMessage: t(
                    "schoolOnboarding.steps.step4.validation.errors.schoolCountry",
                  ),
                })
              }
            />
          </section>

          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolUrn")}
            hint={
              <TextWithLink
                i18nKey="schoolOnboarding.steps.step4.schoolUrnHint"
                to="https://www.get-information-schools.service.gov.uk/Search"
              />
            }
            id="reference"
            name="reference"
            value={stepData["reference"]}
            onChange={onChange}
            fullWidth={true}
          />
        </form>
      </div>
    </>
  );
};

export default Step4;
