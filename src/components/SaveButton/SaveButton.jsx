import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { logInEvent } from "../../events/WebComponentCustomEvents";
import { isOwner } from "../../utils/projectHelpers";

import { Button } from "@raspberrypifoundation/design-system-react";
import { triggerSave } from "../../redux/EditorSlice";

const SaveButton = ({ type, fill = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [buttonType, setButtonType] = useState(type);
  const loading = useSelector((state) => state.editor.loading);
  const webComponent = useSelector((state) => state.editor.webComponent);
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);

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

  return (
    loading === "success" &&
    !projectOwner &&
    buttonType && (
      <Button
        onClick={onClickSave}
        text={t(user ? "header.save" : "header.loginToSave")}
        icon="save"
        type={buttonType}
        fullWidth={fill}
      />
    )
  );
};

export default SaveButton;
