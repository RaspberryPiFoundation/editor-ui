import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import LineIcon from "../../assets/icons/line.svg";
import TextListIconExample from "../../assets/icons/temperature.svg";
import TextList from "../TextList/TextList";
import TextListImageExample from "../../assets/start_icon_dark.svg";

const SchoolOnboarding = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  return (
    <div className="school-onboarding-wrapper">
      <div className="school-onboarding__modal--text">
        <h2 className="school-onboarding__modal--title">
          {t("schoolOnboarding.title_1")}
        </h2>
        <img src={LineIcon} alt="" />
        <h2 className="school-onboarding__modal--subtitle">
          {t("schoolOnboarding.title_2")}
        </h2>
      </div>
      <div className="school-onboarding__modal">
        <span className="school-onboarding__modal-steps">
          {t("schoolOnboarding.steps")}
        </span>
        <h3 className="school-onboarding__modal-step">
          {t("schoolOnboarding.step")}
        </h3>
        <section className="grey__section"></section>
        <div className="school-onboarding__modal--buttons">
          <DesignSystemButton
            className="school-onboarding__button"
            href={`/${locale}/`}
            text={t("schoolOnboarding.button_1")}
            textAlways
            onClick={onClickPlausible("Button text")}
            type={"secondary"}
          />
          <DesignSystemButton
            className="school-onboarding__button"
            href={`/${locale}/r`}
            text={t("schoolOnboarding.button_2")}
            textAlways
            onClick={onClickPlausible("Button text")}
          />
        </div>
      </div>
      <TextList
        title="School account created!"
        titleIcon={TextListIconExample}
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
        title="School account created!"
        text="Thank you for setting up your school account in the Code Editor!"
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
