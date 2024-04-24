import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import LineIcon from "../../assets/icons/line.svg";
import MultiStepForm from "./MultistepForm";
import TexListTickIcon from "../../assets/icons/tick-teal.svg";
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
        title={t("schoolCreated.title")}
        titleIcon={TexListTickIcon}
        text={t("schoolCreated.text")}
        next={t("schoolCreated.next")}
        imageSrc={TextListImageExample}
        imageAlt=""
        contact={t("schoolCreated.contact")}
        listItems={{
          item1:
            "Thank you for providing the all the information needed to set up your school account.",
          item2:
            "We will verify your school. This may take up to 5 working days. You'll receive a confirmation email once it's been verified.",
          item3:
            "Once your school has been verified, you will be able to log in to the Code Editor with your Raspberry Pi Foundation account and access your school dashboard.",
        }}
        exploreProjects={{
          text: t("schoolCreated.exploreProjects.text"),
          url: t("schoolCreated.exploreProjects.url"),
          plausible: t("schoolCreated.exploreProjects.plausible"),
        }}
        editorHome={{
          text: t("schoolCreated.editorHome.text"),
          url: t("schoolCreated.editorHome.url"),
          plausible: t("schoolCreated.editorHome.plausible"),
        }}
      />
      <TextList
        title={t("schoolBeingVerified.title")}
        text={t("schoolBeingVerified.text")}
        next={t("schoolBeingVerified.next")}
        contact={t("schoolBeingVerified.contact")}
        listItems={{
          item1: t("schoolBeingVerified.listItems.item1"),
          item2: t("schoolBeingVerified.listItems.item2"),
          item3: t("schoolBeingVerified.listItems.item3"),
        }}
        exploreProjects={{
          text: t("schoolBeingVerified.exploreProjects.text"),
          url: t("schoolBeingVerified.exploreProjects.url"),
          plausible: t("schoolBeingVerified.exploreProjects.plausible"),
        }}
        editorHome={{
          text: t("schoolBeingVerified.editorHome.text"),
          url: t("schoolBeingVerified.editorHome.url"),
          plausible: t("schoolBeingVerified.editorHome.plausible"),
        }}
      />
    </div>
  );
};

export default SchoolOnboarding;
