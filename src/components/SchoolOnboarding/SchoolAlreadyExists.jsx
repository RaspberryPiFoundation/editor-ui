import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import TextWithLink from "./TextWithLink";

const SchoolAlreadyExists = () => {
  const { t } = useTranslation();
  return (
    <div className="school-onboarding-form">
      <h3 className="school-onboarding-form__title">
        {t("schoolAlreadyExists.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p className="school-onboarding-form__text">
          {t("schoolAlreadyExists.explanation")}
        </p>
        <p className="school-onboarding-form__text">
          <TextWithLink
            i18nKey="schoolAlreadyExists.contact"
            href="mailto:websupport@raspberrypi.org"
          />
        </p>
      </div>
      <div className="school-onboarding-form__buttons">
        <DesignSystemButton
          className="school-onboarding__button"
          text={t("schoolAlreadyExists.exploreProjects")}
          href="https://projects.raspberrypi.org"
          textAlways
          type={"secondary"}
        />
        <DesignSystemButton
          className="school-onboarding__button"
          text={t("schoolAlreadyExists.editorHome")}
          textAlways
          href="/"
          type={"primary"}
        />
      </div>
    </div>
  );
};

export default SchoolAlreadyExists;
