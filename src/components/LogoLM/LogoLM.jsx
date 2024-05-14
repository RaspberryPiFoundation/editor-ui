import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/LogoLM.scss";

const LogoLM = () => {
  const { t } = useTranslation();

  return (
    <div className="logo-lm-wrapper" data-testid="logo-lm">
      <div className="logo-lm__text">
        <h2 className="logo-lm__title">{t("logoLM.codeEditor")}</h2>
        <h2 className="logo-lm-__subtitle">{t("logoLM.forEducation")}</h2>
      </div>
    </div>
  );
};

export default LogoLM;
