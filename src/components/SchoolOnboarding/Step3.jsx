import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Step3 = () => {
  const { t } = useTranslation();
  const [stepData, setStepData] = useState(
    JSON.parse(localStorage.getItem("schoolOnboarding"))["step_3"] || {},
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
        step_3: stepData,
      }),
    );
  }, [stepData]);

  return (
    <>
      <h3 className="school-onboarding__modal-step">
        {t("schoolOnboarding.steps.step3.title")}
      </h3>
      <div className="school-onboarding__modal--content">
        <p>{t("schoolOnboarding.steps.step3.optionalInfo")}</p>
        <form>
          <div>
            <label>
              {t("schoolOnboarding.steps.step3.role")}
              <div>
                <select
                  name="role"
                  onChange={onChange}
                  defaultValue=""
                  value={stepData["role"]}
                >
                  <option value="">
                    {t("schoolOnboarding.steps.step3.select")}
                  </option>
                  <option value="teacher">
                    {t("schoolOnboarding.steps.step3.teacher")}
                  </option>
                  <option value="head_of_department">
                    {t("schoolOnboarding.steps.step3.headOfDepartment")}
                  </option>
                  <option value="adminastrative_staff">
                    {t("schoolOnboarding.steps.step3.admin")}
                  </option>
                  <option value="other">
                    {t("schoolOnboarding.steps.step3.other")}
                  </option>
                </select>
              </div>
            </label>
          </div>
          <div>
            <label>
              {t("schoolOnboarding.steps.step3.department")}
              <p>{t("schoolOnboarding.steps.step3.departmentHint")}</p>
              <input
                type="text"
                name="department"
                onChange={onChange}
                value={stepData["department"]}
              />
            </label>
          </div>
        </form>
      </div>
    </>
  );
};

export default Step3;
