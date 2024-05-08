import React from "react";
import { useTranslation } from "react-i18next";
import "../../../assets/stylesheets/MembersPageHeader.scss";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import { ReactComponent as PlusIcon } from "../../../assets/icons/plus.svg";
import { ReactComponent as SendIcon } from "../../../assets/icons/send.svg";

const MembersPageHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="members-page">
      <h2>{t("membersPageHeader.title")}</h2>
      <p>{t("membersPageHeader.text")}</p>
      <DesignSystemButton
        className="landing-page__button"
        href={"/"}
        text={t("membersPageHeader.invite")}
        icon={<SendIcon />}
        textAlways
      />
      <DesignSystemButton
        className="landing-page__button"
        href={"/"}
        text={t("membersPageHeader.create")}
        icon={<PlusIcon />}
        textAlways
      />
    </div>
  );
};

export default MembersPageHeader;
