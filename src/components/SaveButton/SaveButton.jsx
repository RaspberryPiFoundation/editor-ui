import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { logInEvent } from "../../events/WebComponentCustomEvents";
import { isOwner } from "../../utils/projectHelpers";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import SaveIcon from "../../assets/icons/save.svg";
import OfflineIcon from "../../assets/icons/offline.svg";
import { triggerSave } from "../../redux/EditorSlice";
import useIsOnline from "../../hooks/useIsOnline";

const SaveButton = ({ className, type, fill = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [buttonType, setButtonType] = useState(type);
  const loading = useSelector((state) => state.editor.loading);
  const webComponent = useSelector((state) => state.editor.webComponent);
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const isOnline = useIsOnline();

  useEffect(() => {
    if (!type) {
      setButtonType(!!webComponent ? "primary" : "secondary");
    }
  }, [webComponent, type]);

  const onClickSave = useCallback(async () => {
    if (window.plausible) {
      window.plausible("Save button");
    }
    document.dispatchEvent(logInEvent);
    dispatch(triggerSave());
  }, [dispatch]);

  const projectOwner = isOwner(user, project);

  if (loading !== "success" || projectOwner || !buttonType) return null;

  if (!isOnline && !user) {
    return (
      <div className={classNames(className, "offline-badge")}>
        <OfflineIcon />
        <span>{t("header.offline")}</span>
        <div className="offline-badge__tooltip">
          <p>{t("header.offlineTooltipDevice")}</p>
          <p>{t("header.offlineTooltipContinue")}</p>
        </div>
      </div>
    );
  }

  return (
    <DesignSystemButton
      className={classNames(className, {
        "btn--primary": buttonType === "primary",
        "btn--secondary": buttonType === "secondary",
        "btn--tertiary": buttonType === "tertiary",
      })}
      onClick={onClickSave}
      text={t(user ? "header.save" : "header.loginToSave")}
      textAlways
      icon={<SaveIcon />}
      type={buttonType}
      fill={fill}
    />
  );
};

export default SaveButton;
