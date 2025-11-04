import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { showNewFileModal } from "../redux/EditorSlice";
import PlusIcon from "../assets/icons/plus.svg";

const useNewComponentButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openNewFileModal = () => {
    dispatch(showNewFileModal());
  };

  return [
    {
      text: t("filePanel.newFileButton"),
      textAlways: true,
      icon: <PlusIcon />,
      onClick: openNewFileModal,
      className: "btn--primary",
      fill: true,
    },
  ];
};

export default useNewComponentButton;
