import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import CloudTickIcon from "../../assets/icons/cloud_tick.svg";
import CloudUploadIcon from "../../assets/icons/cloud_upload.svg";

import "../../assets/stylesheets/SaveStatus.scss";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const SaveStatus = ({ isMobile = false }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const saving = useSelector((state) => state.editor.saving);
  const [time, setTime] = useState(Date.now());

  const loading = useSelector((state) => state.editor.loading);

  const isPending = saving === "pending";

  useEffect(() => {
    setTime(Date.now());

    const statusTick = setInterval(() => {
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(statusTick);
  }, [lastSavedTime]);

  return (
    lastSavedTime &&
    loading === "success" && (
      <div
        className={classNames("save-status", {
          "save-status--mobile": isMobile,
        })}
      >
        {isPending ? (
          <>
            <div className="save-status__icon">
              <CloudUploadIcon />
            </div>
            <div className="save-status__text">
              {t("saveStatus.saving")}&hellip;
            </div>
          </>
        ) : (
          <>
            <div className="save-status__icon">
              <CloudTickIcon />
            </div>
            <div className="save-status__text">
              {t("saveStatus.saved")}{" "}
              {formatRelativeTime(lastSavedTime, time, locale)}
            </div>
          </>
        )}
      </div>
    )
  );
};

export default SaveStatus;
