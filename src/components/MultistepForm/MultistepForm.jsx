import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "material-symbols";
import { ProgressBar } from "@raspberrypifoundation/design-system-react";
import classNames from "classnames";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

const MultiStepForm = ({
  storageKey,
  steps,
  checkValidation = () => true,
  onSubmit,
  className = "",
  buttonClassName = "",
  showProgress = true,
  storeCurrentStep = true,
}) => {
  const { t } = useTranslation();

  const totalSteps = steps.length - 1;

  const storageData = JSON.parse(localStorage.getItem(storageKey));
  const [currentStep, setCurrentStep] = useState(
    storeCurrentStep && storageData?.currentStep ? storageData.currentStep : 0,
  );

  const nextStep = () => {
    // TODO: Refactor this call out of the component
    if (!checkValidation(currentStep)) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
    if (currentStep < totalSteps) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...storageData, currentStep: currentStep }),
      );
    }
  }, [currentStep, steps, storageData, totalSteps, storageKey]);

  classNames(
    "multi-step-form",
    className,
    "multi-step-form__buttons",
    `${className}__buttons`,
  );

  return (
    <div className={classNames("multi-step-form", className)}>
      {showProgress && currentStep < totalSteps && (
        <ProgressBar
          percent={((currentStep + 1) / totalSteps) * 100}
          text={`Step ${currentStep + 1} of ${totalSteps}`}
        />
      )}
      {steps[currentStep]}
      {currentStep < totalSteps && (
        <div
          className={classNames("multi-step-form__buttons", {
            [`${className}__buttons`]: className,
          })}
        >
          {currentStep > 0 ? (
            <DesignSystemButton
              className={`multi-step-form__button ${buttonClassName}`}
              text={t("multiStepForm.back")}
              textAlways
              onClick={previousStep}
              type={"secondary"}
            />
          ) : (
            <DesignSystemButton
              className={`multi-step-form__button ${buttonClassName}`}
              text={t("multiStepForm.cancel")}
              textAlways
              href={"/"}
              type={"secondary"}
            />
          )}
          {currentStep < totalSteps - 1 ? (
            <DesignSystemButton
              className={`multi-step-form__button ${buttonClassName}`}
              text={t("multiStepForm.continue")}
              textAlways
              onClick={nextStep}
            />
          ) : (
            <DesignSystemButton
              className="multi-step-form__button"
              text={t("multiStepForm.submit")}
              textAlways
              onClick={() => onSubmit(currentStep, nextStep)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
