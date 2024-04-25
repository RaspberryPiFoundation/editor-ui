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

const Step4 = ({ validationCallback, errorFields }) => {
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
  useEffect(() => {
    console.log(stepData["country_code"]);
  }, [stepData]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setStepData((data) => ({ ...data, [name]: value }));
  };

  const stepErrors = () => {
    const errors = [];
    const validations = [
      () => existsValidation({ stepData, fieldName: "name" }),
      () => urlValidation({ stepData, fieldName: "website" }),
      () => existsValidation({ stepData, fieldName: "address_line_1" }),
      () => existsValidation({ stepData, fieldName: "municipality" }),
      () => existsValidation({ stepData, fieldName: "administrative_area" }),
      () => existsValidation({ stepData, fieldName: "postal_code" }),
      () => existsValidation({ stepData, fieldName: "country" }),
    ];

    validations.forEach((validation) => {
      errors.push(validation());
    });

    return errors;
  };

  useEffect(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("schoolOnboarding")),
        step_4: stepData,
      }),
    );

    validationCallback(stepErrors());
  }, [stepData]);

  return (
    <>
      <h3 className="school-onboarding-form__step">
        {t("schoolOnboarding.steps.step4.title")}
      </h3>
      <div className="school-onboarding-form__content">
        {errorFields.length > 0 && (
          <Alert
            title={t("schoolOnboarding.errorTitle")}
            type="error"
            text={t("schoolOnboarding.steps.step4.validation.error")}
          />
        )}

        <p>{t("schoolOnboarding.steps.step4.schoolDetails")}</p>
        <form>
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolName")}
            id="name"
            name="name"
            value={stepData["name"]}
            onChange={onChange}
            fullWidth={true}
            error={fieldError({
              errorFields,
              fieldName: "name",
              errorMessage: "You must enter a school name",
            })}
          />
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolWebsite")}
            id="website"
            name="website"
            value={stepData["website"]}
            onChange={onChange}
            fullWidth={true}
            error={fieldError({
              errorFields,
              fieldName: "website",
              errorMessage: "School website doesn't look right",
            })}
          />
          <h4>{t("schoolOnboarding.steps.step4.schoolAddress")}</h4>
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolAddress1")}
            id="address_line_1"
            name="address_line_1"
            value={stepData["address_line_1"]}
            onChange={onChange}
            fullWidth={true}
            error={fieldError({
              errorFields,
              fieldName: "address_line_1",
              errorMessage: "Address line 1 doesn't look right",
            })}
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
            error={fieldError({
              errorFields,
              fieldName: "municipality",
              errorMessage: "Village/Town/City doesn't look right",
            })}
          />
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolState")}
            id="administrative_area"
            name="administrative_area"
            value={stepData["administrative_area"]}
            onChange={onChange}
            fullWidth={true}
            error={fieldError({
              errorFields,
              fieldName: "administrative_area",
              errorMessage: "State/County/Province doesn't look right",
            })}
          />
          <TextInput
            label={t("schoolOnboarding.steps.step4.schoolPostcode")}
            id="postal_code"
            name="postal_code"
            value={stepData["postal_code"]}
            onChange={onChange}
            fullWidth={true}
            error={fieldError({
              errorFields,
              fieldName: "postal_code",
              errorMessage: "Postal code/Zip code doesn't look right",
            })}
          />
          <SelectInput
            label={t("schoolOnboarding.steps.step4.schoolCountry")}
            placeholder={t("schoolOnboarding.steps.step4.select")}
            options={[
              // {
              //   key: "",
              //   value: t("schoolOnboarding.steps.step4.select"),
              //   // disabled: true,
              // },
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
          />
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
