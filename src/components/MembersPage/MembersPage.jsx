import React from "react";
import { useTranslation } from "react-i18next";

import "../../assets/stylesheets/MembersPage.scss";
import List from "../List/List";

const MembersPage = () => {
  const { t } = useTranslation();
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
    <div className="members-page">
      {t("membersPage.title")}

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
