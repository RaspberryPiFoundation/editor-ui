import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import MembersPageHeader from "./MembersPageHeader/MembersPageHeader";
import { getUserRoles } from "../../utils/userRoleHelper";
import List from "../List/List";
import useSchool from "../../hooks/useSchool";

import "../../assets/stylesheets/MembersPage.scss";

const MembersPage = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const userRoles = getUserRoles(user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);

  useSchool({ accessToken });

  const actions = [
    {
      text: "Edit details",
      icon: "edit",
      onClick: () => {},
    },
    {
      text: "Change password",
      icon: "password",
      onClick: () => {},
    },
    {
      text: "Remove from school",
      variant: "danger",
      icon: "close",
      onClick: () => {},
    },
  ];

  return (
    <div className="members-page" data-testid="members-page">
      <MembersPageHeader userRoles={userRoles} />

      <List
        noItemsMessage={t("membersPage.noMembersFound")}
        items={[
          {
            primaryText: "User Name",
            secondaryText: "username",
            actions,
          },
          {
            primaryText: "User Name",
            secondaryText: "username",
            actions,
          },
        ]}
      />
    </div>
  );
};

export default MembersPage;
