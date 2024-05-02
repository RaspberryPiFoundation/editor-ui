import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "material-symbols";
import { ProgressBar } from "@raspberrypifoundation/design-system-react";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { createSchool } from "../../utils/apiCallHandler";
import SchoolCreated from "./SchoolCreated";

const MultiStepForm = () => {
  const { t } = useTranslation();

  const [stepIsValid, setStepIsValid] = useState(false);
  const [showInvalidFields, setShowInvalidFields] = useState(false);

  const [apiErrors, setAPIErrors] = useState({});

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
        clearAPIErrors={() => setAPIErrors({})}
      />,
    ],
    [],
  );

  const schoolOnboardingData = useMemo(() => {
    return JSON.parse(localStorage.getItem("schoolOnboarding")) || {};
  }, []);
  const [currentStep, setCurrentStep] = useState(
    schoolOnboardingData?.currentStep ? schoolOnboardingData.currentStep : 0,
  );
  const accessToken = useSelector((state) => state.auth.user?.access_token);

  const checkValidation = () => {
    // If there's a validation callback provided we should check it passes
    if (steps[currentStep].props.stepIsValid) {
      setShowInvalidFields(true);
      return stepIsValid;
    }

    // Steps without a stepIsValid prop are just informational
    return true;
  };

  const nextStep = () => {
    if (!checkValidation()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    if (!checkValidation()) return;
    setAPIErrors({});

    try {
      const response = await createSchool(
        JSON.parse(localStorage.getItem("schoolOnboarding"))["step_4"],
        accessToken,
      );
      if (response && response.status === 201) {
        localStorage.removeItem("schoolOnboarding");
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
    const onPop = (e) => {
      setCurrentStep(e.state.currentStep);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  });

  useEffect(() => {
    setShowInvalidFields(false);

    if (
      window.history.state &&
      window.history.state.currentStep !== currentStep
    ) {
      window.history.pushState({ currentStep }, "");
    }
    document.getElementById("top-center")?.scrollIntoView();
    if (currentStep < steps.length - 1) {
      localStorage.setItem(
        "schoolOnboarding",
        JSON.stringify({ ...schoolOnboardingData, currentStep: currentStep }),
      );
    }
  }, [currentStep, steps, schoolOnboardingData]);

  return (
    <div className="school-onboarding-form">
      {currentStep < steps.length - 1 && (
        <ProgressBar
          percent={((currentStep + 1) / (steps.length - 1)) * 100}
          text={`Step ${currentStep + 1} of ${steps.length - 1}`}
        />
      )}
      {steps[currentStep]}
      {currentStep < steps.length - 1 && (
        <div className="school-onboarding-form__buttons">
          {currentStep > 0 ? (
            <DesignSystemButton
              className="school-onboarding__button"
              text={t("schoolOnboarding.back")}
              textAlways
              onClick={previousStep}
              type={"secondary"}
            />
          ) : (
            <DesignSystemButton
              className="school-onboarding__button"
              text={t("schoolOnboarding.cancel")}
              textAlways
              href={"/"}
              type={"secondary"}
            />
          )}
          {currentStep < steps.length - 2 ? (
            <DesignSystemButton
              className="school-onboarding__button"
              text={t("schoolOnboarding.continue")}
              textAlways
              onClick={nextStep}
            />
          ) : (
            <DesignSystemButton
              className="school-onboarding__button"
              text={t("schoolOnboarding.submit")}
              textAlways
              onClick={onSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
