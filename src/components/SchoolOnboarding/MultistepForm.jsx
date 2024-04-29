import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProgressBar } from "@raspberrypifoundation/design-system-react";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { createSchool } from "../../utils/apiCallHandler";
import { useSelector } from "react-redux";
import SchoolCreated from "./SchoolCreated";

const MultiStepForm = () => {
  const { t } = useTranslation();
  const schoolOnboardingForm = useRef();

  const steps = [<Step1 />, <Step2 />, <Step3 />, <Step4 />, <SchoolCreated />];
  const schoolOnboardingData = useMemo(() => {
    return JSON.parse(localStorage.getItem("schoolOnboarding")) || {};
  }, []);
  const [currentStep, setCurrentStep] = useState(
    schoolOnboardingData?.currentStep ? schoolOnboardingData.currentStep : 0,
  );
  const accessToken = useSelector((state) => state.auth.user?.access_token);

  const nextStep = () => {
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
    if (
      window.history.state &&
      window.history.state.currentStep !== currentStep
    ) {
      window.history.pushState({ currentStep }, "");
    }
    schoolOnboardingForm.current.scrollIntoView();
    if (currentStep < steps.length - 1) {
      localStorage.setItem(
        "schoolOnboarding",
        JSON.stringify({ ...schoolOnboardingData, currentStep: currentStep }),
      );
    }
  }, [currentStep, steps, schoolOnboardingData]);

  return (
    <div className="school-onboarding-form" ref={schoolOnboardingForm}>
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
