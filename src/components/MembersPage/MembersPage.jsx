import React from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/MembersPage.scss";
import UploadMultipleStudents from "./UploadMultipleStudents";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useSchool from "../../hooks/useSchool";
import CreateSingleStudent from "./CreateSingleStudent";

const MembersPage = () => {
  const { identifier } = useParams();
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const { t } = useTranslation();
  useSchool({ id: identifier, accessToken });
  return (
    <>
      <div className="members-page">{t("membersPage.title")}</div>
      <CreateSingleStudent />
      <UploadMultipleStudents />
    </>
  );
};

export default MembersPage;
