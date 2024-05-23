import React from "react";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { Button } from "@raspberrypifoundation/design-system-react";

import "../../assets/stylesheets/ClassPage.scss";

const ClassPage = () => {
  const { t } = useTranslation();
  return (
    <div className="class_wrapper">
      <header>
        <h1 className="class__title">{t("classPage.title")}</h1>
        <p className="class__text">{t("classPage.text")}</p>
        <DesignSystemButton
          className=""
          href={`/`}
          text={t("classPage.classMembers")}
          textAlways
        />
        <Button type="tertiary" iconOnly={true} icon="more_vert" />
      </header>
    </div>
  );
};

export default ClassPage;
