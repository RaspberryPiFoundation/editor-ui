import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import SaveIcon from "../../assets/icons/save.svg";
import { triggerSave } from "../../redux/EditorSlice";

const SaveButton = ({ className, type = "secondary" }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const loading = useSelector((state) => state.editor.loading);

  const onClickSave = async () => {
    if (window.plausible) {
      window.plausible("Save button");
    }
    dispatch(triggerSave());
  };

  return (
    loading === "success" && (
      <DesignSystemButton
        className={className}
        onClick={onClickSave}
        text={t("header.save")}
        textAlways
        icon={<SaveIcon />}
        type={type}
      />
    )
  );
};

export default SaveButton;
