import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { showNewFileModal } from "../../../redux/EditorSlice";
import { Button } from "@raspberrypifoundation/design-system-react";

const NewComponentButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openNewFileModal = () => {
    dispatch(showNewFileModal());
  };

  return (
    <Button
      icon="add"
      linkComponent={null}
      onClick={openNewFileModal}
      text={t("filePanel.newFileButton")}
      fullWidth
    />
  );
};

export default NewComponentButton;
