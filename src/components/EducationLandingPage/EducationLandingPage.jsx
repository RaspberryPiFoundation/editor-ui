import React from "react";
import { useTranslation, Trans } from "react-i18next";
import "../../assets/stylesheets/EducationLandingPage.scss";
import TextImage from "../TextImage/TextImage";
import ide from "../../assets/images/education/ide.png";
import engage from "../../assets/images/education/engage.jpg";
import feedback from "../../assets/images/education/feedback.png";
import classroom from "../../assets/images/education/classroom.jpg";
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
          imageSrc={ide}
        />
        <TextImage
          title={t("educationLandingPage.free.title")}
          text={t("educationLandingPage.free.text")}
        />
        <TextImage
          title={t("educationLandingPage.engage.title")}
          text={t("educationLandingPage.engage.text")}
          imageAlt={t("educationLandingPage.engage.imageAlt")}
          imageSrc={engage}
          imagePosition="left"
        />
        <TextImage
          title={t("educationLandingPage.feedback.title")}
          text={t("educationLandingPage.feedback.text")}
          imageAlt={t("educationLandingPage.feedback.imageAlt")}
          imageSrc={feedback}
        />
        <TextImage
          title={t("educationLandingPage.class.title")}
          text={t("educationLandingPage.class.text")}
        />
        <TextImage
          title={t("educationLandingPage.people.title")}
          text={<Trans i18nKey="educationLandingPage.people.text"></Trans>}
          imageAlt={t("educationLandingPage.people.imageAlt")}
          imageSrc={classroom}
          imagePosition="left"
        />
        <TextImage
          title={t("educationLandingPage.safe.title")}
          text={<Trans i18nKey="educationLandingPage.safe.text"></Trans>}
        />
        <div className="education-landing-page__get-started">
          <h2 className="school-onboarding__subtitle">
            {t("educationLandingPage.getStarted.title")}
          </h2>
          <DesignSystemButton
            className="landing-page__button"
            href={`/${locale}/`}
            text={t("educationLandingPage.getStarted.button")}
            textAlways
            onClick={onClickPlausible("Create your school account")}
          />
        </div>
      </main>
    </div>
  );
};

export default EducationLandingPage;
