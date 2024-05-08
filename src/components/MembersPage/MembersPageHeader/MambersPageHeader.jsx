import React from "react";
import { useTranslation } from "react-i18next";
import "../../../assets/stylesheets/MembersPageHeader.scss";

const MembersPageHeader = () => {
  const { t } = useTranslation();
  return <div className="members-page">{t("membersPageHeader.title")}</div>;
};

export default MembersPageHeader;
