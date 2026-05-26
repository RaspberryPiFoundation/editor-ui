import React from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import OfflineIcon from "../../assets/icons/offline.svg";

const OfflineBadge = ({ className }) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(className, "offline-badge")}
      tabIndex={0}
      aria-describedby="offline-badge-tooltip"
    >
      <OfflineIcon />
      <span>{t("header.offline")}</span>
      <div
        id="offline-badge-tooltip"
        className="offline-badge__tooltip"
        role="tooltip"
      >
        <p>{t("header.offlineTooltipDevice")}</p>
        <p>{t("header.offlineTooltipContinue")}</p>
      </div>
    </div>
  );
};

export default OfflineBadge;
