import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Step4 = () => {
  const { t } = useTranslation();
  const [stepData, setStepData] = useState(
    JSON.parse(
      localStorage.getItem("schoolOnboarding"),
    )["step_4"] || {}
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setStepData((data) => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        ...JSON.parse(
          localStorage.getItem("schoolOnboarding"),
        ),
        step_4: stepData,
      }),
    );
  }, [stepData]);

  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step4.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>{t("schoolOnboarding.steps.step4.schoolDetails")}</p>
        <form>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolName")}
              <input type="text" name="name" value={stepData["name"]} onChange={onChange} />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolWebsite")}
              <input type="text" name="website" value={stepData["website"]} onChange={onChange} />
            </label>
          </div>
          <h4>{t("schoolOnboarding.steps.step4.schoolAddress")}</h4>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolAddress1")}
              <input type="text" name="address_line_1" value={stepData["address_line_1"]} onChange={onChange} />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolAddress2")}
              <input type="text" name="address_line_2" value={stepData["address_line_2"]} onChange={onChange} />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolCity")}
              <input type="text" name="city" value={stepData["city"]} onChange={onChange} />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolState")}
              <input type="text" name="state" value={stepData["state"]} onChange={onChange} />
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolPostcode")}
              <input type="text" name="postcode" value={stepData["postcode"]} onChange={onChange} />
            </label>
          </div>
          <div>
            <select name="country" onChange={onChange} defaultValue="" value={stepData["country"]} >
                  <option value="" disabled>{t("schoolOnboarding.steps.step3.select")}</option>
                  <option value="uk">United Kingdom</option>
                  <option value="usa">USA</option>
                  <option value="kenya">Kenya</option>
                  <option value="india">India</option>
                </select>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step4.schoolUrn")}
              <p>{t("schoolOnboarding.steps.step4.schoolUrnHint")}</p>
              <input type="text" name="urn" value={stepData["urn"]} onChange={onChange} />
            </label>
          </div>
        </form>
      </div>
    </>
  );
};

export default Step4;
