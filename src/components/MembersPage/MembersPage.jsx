import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/MembersPage.scss";
import MembersPageHeader from "./MembersPageHeader/MambersPageHeader";

const MembersPage = () => {
  const { t } = useTranslation();
  const userRoles = useSelector(
    (state) => state.auth.user?.profile?.roles,
  )?.split(",");

  return (
    <div className="members-page">
      {t("membersPage.title")}
      <MembersPageHeader userRoles={userRoles} />
    </div>
  );
};

export default MembersPage;
