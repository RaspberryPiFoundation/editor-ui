import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import EditorBrand from "../EditorBrand/EditorBrand";
import MultiStepForm from "./MultistepForm";

const SchoolOnboarding = () => {
  const { t } = useTranslation();

  return (
    <div className="school-onboarding-wrapper" data-testid="school-onboarding">
      <EditorBrand />
      <MultiStepForm />
    </div>
  );
};

export default SchoolOnboarding;
