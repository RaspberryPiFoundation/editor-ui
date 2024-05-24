import React from "react";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { Button } from "@raspberrypifoundation/design-system-react";
import "material-symbols";

import "../../assets/stylesheets/ClassPage.scss";

const ClassPage = () => {
  const { t } = useTranslation();
  return (
    <div className="class_wrapper">
      <div className="class__copy">
        <h1 className="class__title">Year 8 Computer Science</h1>
        <p className="class__text">
          Lorem ipsum dolor sit amet consectetur. Purus ultrices tristique purus
          eget non felis turpis bibendum. In in malesuada pellentesque arcu eget
          dolor. Aliquam risus magnis semper proin enim nunc. Nibh eget arcu sed
          id sed scelerisque in duis sit.
        </p>
      </div>
      <div className="class__buttons">
        <DesignSystemButton
          className=""
          href={`/`}
          text={t("classPage.classMembers")}
          textAlways
          icon={"group"}
        />
        <div className="class__button">
          <Button type="tertiary" iconOnly={true} icon="settings" />
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
