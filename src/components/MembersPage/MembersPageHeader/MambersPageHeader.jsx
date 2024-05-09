import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "../../../assets/stylesheets/MembersPageHeader.scss";

// import {
//   getUserRoles,
//   isSchoolOwner,
//   isSchoolTeacher,
// } from "../../../utils/userRoleHelper";

import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import { ReactComponent as PlusIcon } from "../../../assets/icons/plus.svg";
import { ReactComponent as SendIcon } from "../../../assets/icons/send.svg";

const MembersPageHeader = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  console.log(`User: ${JSON.stringify(user)}`);
  // const userRoles = getUserRoles(user);
  const userRoles = useSelector(
    (state) => state.auth.user?.profile?.roles,
  )?.split(",");
  console.log(`User roles: ${JSON.stringify(userRoles)}`);

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
        {userRoles.includes("school-owner") && <p>Checking the logic</p>}
        {console.log(userRoles)}
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
