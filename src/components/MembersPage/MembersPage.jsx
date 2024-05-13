import React from "react";
import { useSelector } from "react-redux";
import "../../assets/stylesheets/MembersPage.scss";
import MembersPageHeader from "./MembersPageHeader/MambersPageHeader";

const MembersPage = () => {
  const userRoles = useSelector(
    (state) => state.auth.user?.profile?.roles,
  )?.split(",");

  return (
    <div className="members-page">
      <MembersPageHeader userRoles={userRoles} />
    </div>
  );
};

export default MembersPage;
