import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/EditorBrand.scss";
import LineIcon from "../../assets/icons/line.svg";

const EditorBrand = () => {
  const { t } = useTranslation();

  return (
    <div className="editor-brand-wrapper" data-testid="">
      <div className="editor-brand__text">
        <h2 className="editor-brand__title">{t("editorBrand.codeEditor")}</h2>
        <img src={LineIcon} alt="" />
        <h2 className="editor-brand-__subtitle">
          {t("editorBrand.forEducation")}
        </h2>
      </div>
    </div>
  );
};

export default EditorBrand;
