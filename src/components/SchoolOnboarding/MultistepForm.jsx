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

const MultiStepForm = () => {
  const { t } = useTranslation();

  const [invalidFields, setInvalidFields] = useState([]);
  const [showInvalidFields, setShowInvalidFields] = useState(false);

  const stepInvalidFields = showInvalidFields ? invalidFields : [];

  const steps = [
    <Step1 />,
    <Step2
      validationCallback={setInvalidFields}
      errorFields={stepInvalidFields}
    />,
    <Step3 />,
    <Step4
      validationCallback={setInvalidFields}
      errorFields={stepInvalidFields}
    />,
  ];
  const schoolOnboardingData = useMemo(() => {
    return JSON.parse(localStorage.getItem("schoolOnboarding")) || {};
  }, []);
  const [currentStep, setCurrentStep] = useState(
    schoolOnboardingData?.currentStep ? schoolOnboardingData.currentStep : 0,
  );
  const accessToken = useSelector((state) => state.auth.user?.access_token);

  const checkValidation = () => {
    if (steps[currentStep].props.validationCallback) {
      setShowInvalidFields(true);
      if (invalidFields.length > 0) return false;
    }

    // Steps without a validationCallback prop are just informational
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

    try {
      const response = await createSchool(
        JSON.parse(localStorage.getItem("schoolOnboarding"))["step_4"],
        accessToken,
      );
      if (response && response.status === 201) {
        localStorage.removeItem("schoolOnboarding");
      }
    } catch (error) {
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
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ ...schoolOnboardingData, currentStep: currentStep }),
    );
  }, [currentStep, schoolOnboardingData]);

  return (
    <div className="school-onboarding-form">
      {/* TODO: This is where we want the progress bar to be once it's mereged */}
      <ProgressBar
        percent={((currentStep + 1) / steps.length) * 100}
        text={`Step ${currentStep + 1} of ${steps.length}`}
      />
      {steps[currentStep]}
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
        {currentStep < steps.length - 1 ? (
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
    </div>
  );
};

export default MultiStepForm;
