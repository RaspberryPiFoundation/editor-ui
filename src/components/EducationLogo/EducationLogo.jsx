import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/EducationLogo.scss";

const EducationLogo = () => {
  const { t } = useTranslation();

  return (
    <div className="education-logo-wrapper" data-testid="education-logo">
      <div className="education-logo__text">
        <h2 className="education-logo__title">
          {t("educationLogo.codeEditor")}
        </h2>
        <h2 className="education-logo-__subtitle">
          {t("educationLogo.forEducation")}
        </h2>
      </div>
    </div>
  );
};

export default EducationLogo;
