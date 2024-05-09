import React from "react";
import { useTranslation } from "react-i18next";
import "../../../assets/stylesheets/MembersPageHeader.scss";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import { ReactComponent as PlusIcon } from "../../../assets/icons/plus.svg";
import { ReactComponent as SendIcon } from "../../../assets/icons/send.svg";

const MembersPageHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="members-page-header">
      <div className="members-page-header__copy">
        <h2 className="members-page-header__title">
          {t("membersPageHeader.title")}
        </h2>
        <p className="members-page-header__subtitle">
          {t("membersPageHeader.text")}
        </p>
      </div>
      <div className="members-page-header__buttons">
        <DesignSystemButton
          className="members-page-header__button"
          href={"/"}
          text={t("membersPageHeader.invite")}
          icon={<SendIcon />}
          textAlways
        />
        <DesignSystemButton
          className="members-page-header__button"
          href={"/"}
          text={t("membersPageHeader.create")}
          icon={<PlusIcon />}
          textAlways
        />
      </div>
    </div>
  );
};

export default MembersPageHeader;
