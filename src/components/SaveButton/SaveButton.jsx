import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import SaveIcon from "../../assets/icons/save.svg";
import { triggerSave } from "../../redux/EditorSlice";

const SaveButton = ({ className, type }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [buttonType, setButtonType] = useState(type);
  const loading = useSelector((state) => state.editor.loading);
  const webComponent = useSelector((state) => state.editor.webComponent);

  useEffect(() => {
    if (!type) {
      setButtonType(!!webComponent ? "primary" : "secondary");
    }
  }, [webComponent, type]);

  const onClickSave = async () => {
    if (window.plausible) {
      window.plausible("Save button");
    }
    dispatch(triggerSave());
  };

  return (
    loading === "success" &&
    buttonType && (
      <DesignSystemButton
        className={classNames("btn", className, {
          "btn--primary": buttonType === "primary",
          "btn--secondary": buttonType === "secondary",
          "btn--tertiary": buttonType === "tertiary",
        })}
        onClick={onClickSave}
        text={t(webComponent ? "header.integratedSave" : "header.save")}
        textAlways
        icon={<SaveIcon />}
        type={buttonType}
      />
    )
  );
};

export default SaveButton;
