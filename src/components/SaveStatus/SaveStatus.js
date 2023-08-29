import { intlFormatDistance } from "date-fns";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { CloudUploadIcon, CloudTickIcon } from "../../Icons";
import "./SaveStatus.scss";

const SaveStatus = ({ isMobile = false }) => {
  const { t } = useTranslation();
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
            <div className="save-status__status">
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
              {intlFormatDistance(lastSavedTime, time, { style: "narrow" })}
            </div>
          </>
        )}
      </div>
    )
  );
};

export default SaveStatus;
