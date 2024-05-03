import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SelectInput,
  TextInput,
} from "@raspberrypifoundation/design-system-react";

const Step3 = () => {
  const { t } = useTranslation();
  const schoolOnboardingData = JSON.parse(
    localStorage.getItem("schoolOnboarding"),
  );
  const [stepData, setStepData] = useState(
    schoolOnboardingData && schoolOnboardingData["step_3"]
      ? schoolOnboardingData["step_3"]
      : { role: "", department: "" },
  );
  const onChange = (e) => {
    const { name, value } = e.target;
    setStepData((data) => ({ ...data, [name]: value }));
  };
  const conditionalField = (value, condition) => value === condition;

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
      <h3 className="school-onboarding-form__title">
        {t("schoolOnboarding.steps.step3.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p className="school-onboarding-form__text">
          {t("schoolOnboarding.steps.step3.optionalInfo")}
        </p>
        <form>
          <SelectInput
            label={t("schoolOnboarding.steps.step3.role")}
            placeholder={t("schoolOnboarding.steps.step3.select")}
            options={[
              {
                key: "teacher",
                value: t("schoolOnboarding.steps.step3.teacher"),
              },
              {
                key: "head_of_department",
                value: t("schoolOnboarding.steps.step3.headOfDepartment"),
              },
              {
                key: "administrative_staff",
                value: t("schoolOnboarding.steps.step3.admin"),
              },
              {
                key: "other",
                value: t("schoolOnboarding.steps.step3.other"),
              },
            ]}
            id="role"
            name="role"
            onChange={onChange}
            value={stepData["role"]}
            fullWidth={true}
          />
          {conditionalField(stepData["role"], "other") && (
            <TextInput
              label={t("schoolOnboarding.steps.step3.otherRole")}
              id="other_role"
              name="other_role"
              onChange={onChange}
              value={stepData["other_role"]}
              fullWidth={true}
              error=""
            />
          )}
          <TextInput
            label={t("schoolOnboarding.steps.step3.department")}
            hint={t("schoolOnboarding.steps.step3.departmentHint")}
            id="department"
            name="department"
            onChange={onChange}
            value={stepData["department"]}
            fullWidth={true}
          />
        </form>
      </div>
    </>
  );
};

export default Step3;
