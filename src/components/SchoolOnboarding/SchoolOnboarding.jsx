import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import LineIcon from "../../assets/icons/line.svg";
import MultiStepForm from "./MultistepForm";
import TexListTickIcon from "../../assets/icons/tick.svg";
import TextList from "../TextList/TextList";
import TextListImageExample from "../../assets/images/school-created.svg";

const SchoolOnboarding = () => {
  const { t } = useTranslation();

  return (
    <div className="school-onboarding-wrapper" data-testid="school-onboarding">
      <div className="school-onboarding-form__text">
        <h2 className="school-onboarding-form__title">
          {t("schoolOnboarding.title_1")}
        </h2>
        <img src={LineIcon} alt="" />
        <h2 className="school-onboarding-form__subtitle">
          {t("schoolOnboarding.title_2")}
        </h2>
      </div>
      <MultiStepForm />
      <TextList
        title="School account created!"
        titleIcon={TexListTickIcon}
        text="Thank you for setting up your school account in the Code Editor!"
        next="What happens next?"
        imageSrc={TextListImageExample}
        imageAlt=""
        contact="If you have any issues you can contact us via email: websupport@raspberrypi.org. 
        Please wait at least 5 working days before contacting us about verifying your school."
        listItems={{
          item1:
            "Thank you for providing the all the information needed to set up your school account.",
          item2:
            "We will verify your school. This may take up to 5 working days. You'll receive a confirmation email once it's been verified.",
          item3:
            "Once your school has been verified, you will be able to log in to the Code Editor with your Raspberry Pi Foundation account and access your school dashboard.",
        }}
        exploreProjects={{
          text: "Explore our projects",
          url: "https://example.com/button1",
          plausible: "Explore our projects",
        }}
        editorHome={{
          text: "Code Editor home",
          url: "/",
          plausible: "Code Editor home",
        }}
      />
      <TextList
        title="Your school account is being verified"
        text="You have already set up a school account and it is now in the process of being verified. If you wish to set up another account for a different school, you must use a different Raspberry Pi Foundation account."
        next="What happens next?"
        contact="If you have any issues you can contact us via email: websupport@raspberrypi.org. 
        Please wait at least 5 working days before contacting us about verifying your school."
        listItems={{
          item1:
            "Thank you for providing the all the information needed to set up your school account.",
          item2:
            "We will verify your school. This may take up to 5 working days. You'll receive a confirmation email once it's been verified.",
          item3:
            "Once your school has been verified, you will be able to log in to the Code Editor with your Raspberry Pi Foundation account and access your school dashboard.",
        }}
        exploreProjects={{
          text: "Explore our projects",
          url: "https://example.com/button1",
          plausible: "Explore our projects",
        }}
        editorHome={{
          text: "Code Editor home",
          url: "/",
          plausible: "Code Editor home",
        }}
      />
    </div>
  );
};

export default SchoolOnboarding;
