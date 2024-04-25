import React from "react";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import EditorBrand from "../EditorBrand/EditorBrand";
import MultiStepForm from "./MultistepForm";
import TexListTickIcon from "../../assets/icons/tick-teal.svg";
import TextList from "../TextList/TextList";
import TextListImageExample from "../../assets/images/school-created.svg";

const SchoolOnboarding = () => {
  return (
    <div className="school-onboarding-wrapper" data-testid="school-onboarding">
      <EditorBrand />
      <MultiStepForm />
    </div>
  );
};

export default SchoolOnboarding;
