import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/EducationLandingPage.scss";
import TextImage from "../TextImage/TextImage";
import editorScreenshot from "../../assets/images/editor.png";
import editorOutput from "../../assets/images/output.png";
import classroom from "../../assets/images/classroom.jpg";
import placeholder from "../../assets/images/hero-placeholder.svg";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import Hero from "../Hero/Hero";

const EducationLandingPage = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  return (
    <div
      className="education-landing-page-wrapper"
      data-testid="education-landing-page"
    >
      <Hero />
      <main>
        <TextImage
          title={t("educationLandingPage.ide.title")}
          text={t("educationLandingPage.ide.text")}
          imageAlt={t("educationLandingPage.ide.imageAlt")}
          imageSrc={editorScreenshot}
        />
        <TextImage
          title={t("educationLandingPage.free.title")}
          text={t("educationLandingPage.free.text")}
          imageAlt={t("educationLandingPage.free.imageAlt")}
          imageSrc={editorOutput}
          imagePosition="right"
        />
        <TextImage
          title={t("educationLandingPage.engage.title")}
          text={t("educationLandingPage.engage.text")}
        />
        <TextImage
          title={t("educationLandingPage.feedback.title")}
          text={t("educationLandingPage.feedback.text")}
          imageAlt={t("educationLandingPage.feedback.imageAlt")}
          imageSrc={placeholder}
          imagePosition="right"
        />
        <TextImage
          title={t("educationLandingPage.class.title")}
          text={t("educationLandingPage.class.text")}
        />
        <TextImage
          title={t("educationLandingPage.people.title")}
          text={t("educationLandingPage.people.text")}
          imageAlt={t("educationLandingPage.people.imageAlt")}
          o
          imageSrc={classroom}
        />
        <TextImage
          title={t("educationLandingPage.safe.title")}
          text={t("educationLandingPage.safe.text")}
        />
        <div className="education-landing-page__get-started">
          <h2 className="school-onboarding__subtitle">
            {t("educationLandingPage.title")}
          </h2>
          <DesignSystemButton
            className="landing-page__button"
            href={`/${locale}/`}
            text={t("educationLandingPage.start")}
            textAlways
            onClick={onClickPlausible("Create your school accout")}
          />
        </div>
      </main>
    </div>
  );
};

export default EducationLandingPage;
