import React from "react";
import { useDispatch } from "react-redux";

import { showNewFileModal } from "../../../redux/EditorSlice";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import PlusIcon from "../../../assets/icons/plus.svg";
import { useTranslation } from "react-i18next";

const NewComponentButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openNewFileModal = () => {
    dispatch(showNewFileModal());
  };

  return (
    <DesignSystemButton
      text={t("filePanel.newFileButton")}
      textAlways
      icon={<PlusIcon />}
      onClick={openNewFileModal}
      className="btn"
      fill={true}
    />
  );
};

export default NewComponentButton;
