import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { logInEvent } from "../../events/WebComponentCustomEvents";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import SaveIcon from "../../assets/icons/save.svg";
import { triggerSave } from "../../redux/EditorSlice";
import { useScratchSave } from "../../hooks/useScratchSave";

const SaveButton = ({ className, type, fill = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [buttonType, setButtonType] = useState(type);
  const webComponent = useSelector((state) => state.editor.webComponent);
  const {
    enableScratchSaveState,
    isScratchSaving,
    loading,
    projectOwner,
    saveScratchProject,
    scratchSaveLabelKey,
    shouldRemixOnSave,
    user,
  } = useScratchSave();

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
  }, [dispatch, enableScratchSaveState, saveScratchProject, shouldRemixOnSave]);

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
