import React, { useMemo, useEffect, useState } from "react";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import EducationLogo from "../EducationLogo/EducationLogo";
import MultiStepForm from "../MultistepForm/MultistepForm";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { login } from "../../utils/login";
import { useLocation } from "react-router-dom";
import useSchool from "../../hooks/useSchool";
import SchoolBeingVerified from "./SchoolBeingVerified";
import SchoolAlreadyExists from "./SchoolAlreadyExists";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import SchoolCreated from "./SchoolCreated";

import { createSchool } from "../../utils/apiCallHandler";

const SchoolOnboarding = () => {
  const { t } = useTranslation();

  const isLoadingUser = useSelector((state) => state.auth.isLoadingUser);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const school = useSelector((state) => state.school);
  const location = useLocation();

  const storageKey = "schoolOnboarding";

  const [stepIsValid, setStepIsValid] = useState(false);
  const [showInvalidFields, setShowInvalidFields] = useState(false);
  const [apiErrors, setAPIErrors] = useState({});
  const clearAPIErrors = () => setAPIErrors({});

  const steps = useMemo(
    () => [
      <Step1 />,
      <Step2
        stepIsValid={setStepIsValid}
        showInvalidFields={showInvalidFields}
      />,
      <Step3 />,
      <Step4
        stepIsValid={setStepIsValid}
        showInvalidFields={showInvalidFields}
        apiErrors={apiErrors}
      />,
      <SchoolCreated />,
    ],
    [showInvalidFields, apiErrors],
  );

  const checkValidation = (currentStep) => {
    document.getElementById("top-center")?.scrollIntoView();

    setShowInvalidFields(false);

    // If there's a validation callback provided we should check it passes
    if (steps[currentStep].props.stepIsValid) {
      setShowInvalidFields(true);
      return stepIsValid;
    }

    // Steps without a stepIsValid prop are just informational
    return true;
  };

  const onSubmit = async (currentStep, nextStep) => {
    if (!checkValidation(currentStep)) return;

    clearAPIErrors();

    try {
      const formData = JSON.parse(localStorage.getItem(storageKey));
      const creator_data = {
        creator_role:
          formData["step_3"].creator_role !== "other"
            ? formData["step_3"].creator_role
            : formData["step_3"].creator_role_other,
        creator_department: formData["step_3"].creator_department,
      };
      const response = await createSchool(
        { ...formData["step_2"], ...creator_data, ...formData["step_4"] },
        accessToken,
      );
      if (response && response.status === 201) {
        localStorage.removeItem(storageKey);
        nextStep();
      }
    } catch (error) {
      const { response } = error;
      let errors = {};

      // If the response is a 422 pass the errors to the form
      if (response?.status === 422) {
        errors = response?.data?.error;
      } else {
        // otherwise surface the error to the user
        errors[response?.status] = [
          t(
            `schoolOnboarding.steps.errors.${response?.status}`,
            response?.statusText,
          ),
        ];
      }

      setAPIErrors(errors);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isLoadingUser && !accessToken) {
      login({ location });
    }
  });

  useSchool({ accessToken });

  return (
    user && (
      <div
        className="school-onboarding-wrapper"
        data-testid="school-onboarding"
      >
        <EducationLogo />
        {school.id ? (
          school.verified_at ? (
            <SchoolAlreadyExists />
          ) : (
            <SchoolBeingVerified />
          )
        ) : (
          school.loading === false && (
            <MultiStepForm
              storageKey={storageKey}
              steps={steps}
              checkValidation={checkValidation}
              onSubmit={onSubmit}
              className="school-onboarding-form"
              buttonClassName="school-onboarding-button"
            />
          )
        )}
      </div>
    )
  );
};

export default SchoolOnboarding;
