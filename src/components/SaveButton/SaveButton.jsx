import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  logInEvent,
  saveTriggeredEvent,
} from "../../events/WebComponentCustomEvents";
import { isOwner } from "../../utils/projectHelpers";

import { Button } from "@raspberrypifoundation/design-system-react";
import OfflineBadge from "../OfflineBadge/OfflineBadge";
import SaveIcon from "../../assets/icons/save.svg";
import { triggerSave } from "../../redux/EditorSlice";
import useIsOnline from "../../hooks/useIsOnline";
import { usePreviewMode } from "../../hooks/usePreviewMode";

const SaveButton = ({ className }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const loading = useSelector((state) => state.editor.loading);
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const offlineEnabled = useSelector((state) => state.editor.offlineEnabled);
  const readOnly = useSelector((state) => state.editor.readOnly);
  const previewMode = usePreviewMode();
  const isOnline = useIsOnline();

  const onClickSave = useCallback(async () => {
    if (window.plausible) {
      window.plausible("Save button");
    }
    document.dispatchEvent(saveTriggeredEvent({ loggedIn: !!user }));
    document.dispatchEvent(logInEvent);
    dispatch(triggerSave());
  }, [dispatch, user]);

  const projectOwner = isOwner(user, project);

  if (loading !== "success" || projectOwner || readOnly || previewMode)
    return null;

  if (offlineEnabled && !isOnline) {
    return <OfflineBadge className={className} />;
  }

  return (
    <Button
      className={className}
      onClick={onClickSave}
      text={t(user ? "header.save" : "header.loginToSave")}
      icon={<SaveIcon />}
      iconPosition="right"
    />
  );
};

export default SaveButton;
