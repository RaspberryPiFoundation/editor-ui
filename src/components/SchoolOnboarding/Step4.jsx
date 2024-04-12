import { useTranslation } from "react-i18next";

const Step4 = () => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step4.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>{t("schoolOnboarding.steps.step4.schoolDetails")}</p>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolName")}
            <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolWebsite")}
            <input type="text" name="website" />
          </label>
        </div>
        <h4>{t("schoolOnboarding.steps.step4.schoolAddress")}</h4>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolAddress1")}
            <input type="text" name="address_line_1" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolAddress2")}
            <input type="text" name="address_line_2" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolCity")}
            <input type="text" name="city" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolState")}
            <input type="text" name="state" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolPostcode")}
            <input type="text" name="postcode" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolCountry")}
            <input type="text" name="country" />
          </label>
        </div>
        <div>
          <label>
            {t("schoolOnboarding.steps.step4.schoolUrn")}
            <p>{t("schoolOnboarding.steps.step4.schoolUrnHint")}</p>
            <input type="text" name="urn" />
          </label>
        </div>
      </div>
    </>
  );
};

export default Step4;
