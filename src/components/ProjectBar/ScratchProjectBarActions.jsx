import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@raspberrypifoundation/design-system-react";

import SaveIcon from "../../assets/icons/save.svg";
import SaveStatus from "../SaveStatus/SaveStatus";
import { setScratchLastSavedTime } from "../../redux/EditorSlice";
import { useScratchSave } from "../../hooks/useScratchSave";
import { saveTriggeredEvent } from "../../events/WebComponentCustomEvents";

const getProjectLastSavedTime = (updatedAt) => {
  const timestamp = Date.parse(updatedAt || "");
  return Number.isNaN(timestamp) ? null : timestamp;
};

const ScratchProjectBarActions = ({ canSave }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const { saveScratchProject, shouldRemixOnSave } = useScratchSave({
    enabled: canSave,
  });

  const onClickSave = () => {
    document.dispatchEvent(saveTriggeredEvent({ loggedIn: !!user }));
    saveScratchProject({ shouldRemixOnSave });
  };

  const projectIdentifier = project?.identifier;
  const isScratchSaving = saving === "pending";
  const isScratchSaveFailed = saving === "failed";
  const isNewProject = !projectIdentifier;
  const canAutoSave = Boolean(projectIdentifier && !shouldRemixOnSave);
  const showSaveButton = canSave && (isNewProject || shouldRemixOnSave);
  const showSaveStatus =
    canSave && canAutoSave && Boolean(lastSavedTime) && !isScratchSaveFailed;
  const projectLastSavedTime = getProjectLastSavedTime(project?.updated_at);

  useEffect(() => {
    if (!canSave || !canAutoSave || lastSavedTime || !projectLastSavedTime) {
      return;
    }

    dispatch(
      setScratchLastSavedTime({
        lastSavedTime: projectLastSavedTime,
      }),
    );
  }, [dispatch, canAutoSave, canSave, lastSavedTime, projectLastSavedTime]);

  return (
    <>
      {showSaveButton && (
        <Button
          aria-label={t("header.save")}
          onClick={onClickSave}
          text={t("header.save")}
          icon={<SaveIcon />}
          iconPosition="right"
          size="small"
          disabled={isScratchSaving}
        />
      )}
      {showSaveStatus && <SaveStatus />}
    </>
  );
};

export default ScratchProjectBarActions;
