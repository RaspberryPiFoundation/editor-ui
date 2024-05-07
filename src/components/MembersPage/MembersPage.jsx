import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/MembersPage.scss";

const MembersPage = () => {
  const { t } = useTranslation();
  return <div className="members-page__wrapper">{t("membersPage.title")}</div>;
};

export default MembersPage;
