import React from "react";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { ReactComponent as GroupIcon } from "../../assets/icons/group.svg";
import { Button } from "@raspberrypifoundation/design-system-react";
import "material-symbols";

import "../../assets/stylesheets/ClassPage.scss";

const ClassPage = () => {
  const { t } = useTranslation();
  return (
    <div data-testid="class-page" className="class_wrapper">
      <div className="class__copy">
        <h1 className="class__title">{t("classPage.title")}</h1>
        <p className="class__text">{t("classPage.text")}</p>
      </div>
      <div className="class__buttons">
        <DesignSystemButton
          className=""
          href={`/`}
          text={t("classPage.classMembers")}
          textAlways
          icon={<GroupIcon />}
        />
        <div className="class__button">
          <Button type="tertiary" iconOnly={true} icon="settings" />
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
