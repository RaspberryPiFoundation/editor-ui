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

      <List noItemMessage={t("membersPage.noMembersFound")} items={[]} />
    </div>
  );
};

export default MembersPage;
