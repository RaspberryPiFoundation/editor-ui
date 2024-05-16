import React from "react";
import { useSelector } from "react-redux";
import "../../assets/stylesheets/MembersPage.scss";
import UploadMultipleStudents from "./UploadMultipleStudents";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useSchool from "../../hooks/useSchool";
import CreateSingleStudent from "./CreateSingleStudent";

const MembersPage = () => {
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user);
  const userRoles = getUserRoles(user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const { t } = useTranslation();

  useSchool({ id: identifier, accessToken });

  return (
    <div className="members-page" data-testid="members-page">
      <MembersPageHeader userRoles={userRoles} />
      <CreateSingleStudent />
      <UploadMultipleStudents />
    </div>
  );
};

export default MembersPage;
