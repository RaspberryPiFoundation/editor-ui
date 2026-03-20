import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { logInEvent } from "../../events/WebComponentCustomEvents";
import { isOwner } from "../../utils/projectHelpers";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import SaveIcon from "../../assets/icons/save.svg";
import { triggerSave } from "../../redux/EditorSlice";
import { useScratchSaveState } from "../../hooks/useScratchSaveState";

const SaveButton = ({ className, type, fill = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [buttonType, setButtonType] = useState(type);
  const loading = useSelector((state) => state.editor.loading);
  const webComponent = useSelector((state) => state.editor.webComponent);
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const scratchIframeProjectIdentifier = useSelector(
    (state) => state.editor.scratchIframeProjectIdentifier,
  );
  const isScratchProject = project?.project_type === "code_editor_scratch";
  const enableScratchSaveState = Boolean(
    loading === "success" && user && isScratchProject,
  );
  const shouldRemixOnSave = Boolean(
    enableScratchSaveState &&
      isOwner(user, project) === false &&
      project.identifier &&
      project.identifier === scratchIframeProjectIdentifier,
  );
  const { isScratchSaving, saveScratchProject, scratchSaveLabelKey } =
    useScratchSaveState({
      enabled: enableScratchSaveState,
    });

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
    if (enableScratchSaveState) {
      saveScratchProject({ shouldRemixOnSave });
      return;
    }
    dispatch(triggerSave());
  }, [
    dispatch,
    enableScratchSaveState,
    saveScratchProject,
    shouldRemixOnSave,
  ]);

  const projectOwner = isOwner(user, project);
  const buttonText = t(
    enableScratchSaveState
      ? scratchSaveLabelKey
      : user
        ? "header.save"
        : "header.loginToSave",
  );

  return (
    loading === "success" &&
    !projectOwner &&
    buttonType && (
      <DesignSystemButton
        className={classNames(className, {
          "btn--primary": buttonType === "primary",
          "btn--secondary": buttonType === "secondary",
          "btn--tertiary": buttonType === "tertiary",
        })}
        onClick={onClickSave}
        text={buttonText}
        textAlways
        icon={<SaveIcon />}
        type={buttonType}
        fill={fill}
        disabled={isScratchSaving}
      />
    )
  );
};

export default SaveButton;
