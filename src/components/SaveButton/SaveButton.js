import { intlFormatDistance } from "date-fns";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { CloudUploadIcon, CloudTickIcon } from "../../Icons";
import "./SaveButton.scss";

const SaveButton = () => {
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
    loading === "success" && (
      <div className="save-button">
        {isPending ? (
          <>
            <div className="save-button__icon">
              <CloudUploadIcon />
            </div>
            <div className="save-button__status">
              {t("saveButton.saving")}&hellip;
            </div>
          </>
        ) : (
          <>
            <div className="save-button__icon">
              <CloudTickIcon />
            </div>
            <div className="save-button__status">
              {t("saveButton.saved")}{" "}
              {intlFormatDistance(lastSavedTime, time, { style: "narrow" })}
            </div>
          </>
        )}
      </div>
    )
  );
};

export default SaveButton;
