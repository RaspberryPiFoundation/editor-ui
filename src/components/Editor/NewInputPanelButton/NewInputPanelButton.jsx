import React from "react";
import { Button } from "@raspberrypifoundation/design-system-react";
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
      text={t("newInputPanelButton.buttonText")}
      onClick={openNewPanel}
    />
  );
};

export default NewInputPanelButton;
