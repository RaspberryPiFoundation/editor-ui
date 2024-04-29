import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

const SchoolAlreadyExists = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="school-onboarding-form__title">
        {t("schoolAlreadyExists.title")}
      </h3>
      <div className="school-onboarding-form__content">
        <p className="school-onboarding-form__text">
          {t("schoolAlreadyExists.explantation")}
        </p>
        <p className="school-onboarding-form__text">
          {t("schoolAlreadyExists.contact")}
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
          type={"secondary"}
        />
      </div>
    </>
  );
};

export default SchoolAlreadyExists;
