import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/MembersPage.scss";
import UploadMultipleStudents from "./UploadMultipleStudents";

const MembersPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="members-page">{t("membersPage.title")}</div>
      <UploadMultipleStudents />
    </>
  );
};

export default MembersPage;
