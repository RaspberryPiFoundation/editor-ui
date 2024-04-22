import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TextWithLink from "./TextWithLink";

const Step4 = () => {
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
          city: "",
          state: "",
          postcode: "",
          country: "",
          urn: "",
        },
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setStepData((data) => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("schoolOnboarding")),
        step_4: stepData,
      }),
    );
  }, [stepData]);

  return (
    <>
      <h3 className="school-onboarding-form__step">
        {t("schoolOnboarding.steps.step4.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p>{t("schoolOnboarding.steps.step4.schoolDetails")}</p>
        <form>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolName")}
              <input
                type="text"
                name="name"
                value={stepData["name"]}
                onChange={onChange}
              />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolWebsite")}
              <input
                type="text"
                name="website"
                value={stepData["website"]}
                onChange={onChange}
              />
            </label>
          </div>
          <h4>{t("schoolOnboarding.steps.step4.schoolAddress")}</h4>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolAddress1")}
              <input
                type="text"
                name="address_line_1"
                value={stepData["address_line_1"]}
                onChange={onChange}
              />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolAddress2")}
              <input
                type="text"
                name="address_line_2"
                value={stepData["address_line_2"]}
                onChange={onChange}
              />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolCity")}
              <input
                type="text"
                name="municipality"
                value={stepData["municipality"]}
                onChange={onChange}
              />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolState")}
              <input
                type="text"
                name="administrative_area"
                value={stepData["administrative_area"]}
                onChange={onChange}
              />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolPostcode")}
              <input
                type="text"
                name="postal_code"
                value={stepData["postal_code"]}
                onChange={onChange}
              />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolCountry")}
              <select
                name="country_code"
                onChange={onChange}
                defaultValue=""
                value={stepData["country_code"]}
              >
                <option value="" disabled>
                  {t("schoolOnboarding.steps.step3.select")}
                </option>
                <option value="GB">United Kingdom</option>
                <option value="US">USA</option>
                <option value="KE">Kenya</option>
                <option value="IN">India</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolUrn")}
              <p>
                <TextWithLink
                  i18nKey="schoolOnboarding.steps.step4.schoolUrnHint"
                  to="https://www.get-information-schools.service.gov.uk/Search"
                />
              </p>
              <input
                type="text"
                name="reference"
                value={stepData["reference"]}
                onChange={onChange}
              />
            </label>
          </div>
        </form>
      </div>
    </>
  );
};

export default Step4;
