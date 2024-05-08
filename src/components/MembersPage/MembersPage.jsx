import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/MembersPage.scss";
import MembersPageHeader from "./MembersPageHeader/MambersPageHeader";

const MembersPage = () => {
  const { t } = useTranslation();
  return (
    <div className="members-page">
      {t("membersPage.title")}
      <MembersPageHeader />
    </div>
  );
};

export default MembersPage;
