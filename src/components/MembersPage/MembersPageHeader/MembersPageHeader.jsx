import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "../../../assets/stylesheets/MembersPageHeader.scss";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import PlusIcon from "../../../assets/icons/plus.svg";
import SendIcon from "../../../assets/icons/send.svg";
import { isSchoolOwner } from "../../../utils/userRoleHelper";

const MembersPageHeader = ({ userRoles }) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  if (!user) return "Not logged in";

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
        {isSchoolOwner(userRoles) && (
          <DesignSystemButton
            className="members-page-header__button"
            href={"/"}
            text={t("membersPageHeader.invite")}
            icon={<SendIcon />}
            textAlways
          />
        )}
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
