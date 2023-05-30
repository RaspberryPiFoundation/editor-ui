import { intlFormatDistance } from "date-fns";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { CloudUploadIcon, CloudTickIcon } from "../../Icons";

const Autosave = () => {
  const { t } = useTranslation();
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const saving = useSelector((state) => state.editor.saving);
  const [time, setTime] = useState(Date.now());

  const isPending = saving === "pending";

  useEffect(() => {
    setTime(Date.now());

    const statusTick = setInterval(() => {
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(statusTick);
  }, [lastSavedTime]);

  return (
    <div className="autosave">
      {isPending ? (
        <>
          <div className="autosave__icon">
            <CloudUploadIcon />
          </div>
          <div className="autosave__status">
            {t("header.autoSaving")}&hellip;
          </div>
        </>
      ) : (
        <>
          <div className="autosave__icon">
            <CloudTickIcon />
          </div>
          <div className="autosave__status">
            {t("header.autoSaved")}{" "}
            {intlFormatDistance(lastSavedTime, time, { style: "narrow" })}
          </div>
        </>
      )}
    </div>
  );
};

export default Autosave;
