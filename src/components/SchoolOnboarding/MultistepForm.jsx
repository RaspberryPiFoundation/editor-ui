import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

const MultiStepForm = () => {
  const { t } = useTranslation();

  const steps = [<Step1 />, <Step2 />, <Step3 />, <Step4 />];
  const schoolOnboardingData = JSON.parse(
    localStorage.getItem("schoolOnboarding"),
  );
  const [currentStep, setCurrentStep] = useState(
    schoolOnboardingData ? schoolOnboardingData["currentStep"] : 0,
  );

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

  const onPop = (e) => {
    setCurrentStep(e.state.currentStep);
  };

  useEffect(() => {
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, [onPop]);

  useEffect(() => {
    if (window.history.state.currentStep !== currentStep) {
      window.history.pushState({ currentStep }, "");
    }
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ ...schoolOnboardingData, currentStep: currentStep }),
    );
  }, [currentStep]);

  return (
    <div className="school-onboarding__modal">
      {/* This is where we want the progress bar to be once it's mereged */}
      {/* <span className="school-onboarding__modal-steps">
        {t("schoolOnboarding.steps")}
      </span> */}
      {/* <h3 className="school-onboarding__modal-step">
        {steps[currentStep].title}
      </h3>
      <div className="school-onboarding__modal--content">
        {steps[currentStep].content}
      </div> */}
      {steps[currentStep]}
      <div className="school-onboarding__modal--buttons">
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
            onClick={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
