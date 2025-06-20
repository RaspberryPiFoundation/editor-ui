import React from "react";
import Button from "../../Button/Button";
import { useDispatch } from "react-redux";
import { addFilePanel } from "../EditorSlice";
import { useTranslation } from "react-i18next";

const NewInputPanelButton = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const openNewPanel = () => {
    dispatch(addFilePanel());
  };
  return (
    <Button
      className={"btn--primary"}
      buttonText={t("newInputPanelButton.buttonText")}
      onClickHandler={openNewPanel}
    />
  );
};

export default NewInputPanelButton;
