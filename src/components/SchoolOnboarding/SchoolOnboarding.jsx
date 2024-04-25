import React from "react";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import LogoLM from "../LogoLM/LogoLM";
import MultiStepForm from "./MultistepForm";

const SchoolOnboarding = () => {
  return (
    <div className="school-onboarding-wrapper" data-testid="school-onboarding">
      <LogoLM />
      <MultiStepForm />
    </div>
  );
};

export default SchoolOnboarding;
