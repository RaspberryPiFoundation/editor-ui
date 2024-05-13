import React from "react";
import { useSelector } from "react-redux";
import "../../assets/stylesheets/MembersPage.scss";
import MembersPageHeader from "./MembersPageHeader/MambersPageHeader";
import { getUserRoles } from "../../utils/userRoleHelper";

const MembersPage = () => {
  const user = useSelector((state) => state.auth.user);
  const userRoles = getUserRoles(user);

  return (
    <div className="members-page">
      <MembersPageHeader userRoles={userRoles} />
    </div>
  );
};

export default MembersPage;
