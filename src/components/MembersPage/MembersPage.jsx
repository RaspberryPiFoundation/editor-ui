import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import useSchool from "../../hooks/useSchool";
import { getUserRoles } from "../../utils/userRoleHelper";
import MembersPageHeader from "./MembersPageHeader/MembersPageHeader";
import UploadMultipleStudents from "./UploadMultipleStudents";
import CreateSingleStudent from "./CreateSingleStudent";
import "../../assets/stylesheets/MembersPage.scss";

const MembersPage = () => {
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user);
  const userRoles = getUserRoles(user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);

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
