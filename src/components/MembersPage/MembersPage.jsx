import React from "react";
import { useSelector } from "react-redux";

import useSchool from "../../hooks/useSchool";
import { getUserRoles } from "../../utils/userRoleHelper";
import MembersPageHeader from "./MembersPageHeader/MembersPageHeader";
import "../../assets/stylesheets/MembersPage.scss";

const MembersPage = () => {
  const user = useSelector((state) => state.auth.user);
  const userRoles = getUserRoles(user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);

  useSchool({ accessToken });

  return (
    <div className="members-page" data-testid="members-page">
      <MembersPageHeader userRoles={userRoles} />
    </div>
  );
};

export default MembersPage;
