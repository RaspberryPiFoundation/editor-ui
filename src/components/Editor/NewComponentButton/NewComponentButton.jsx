import "../../../assets/stylesheets/NewComponentButton.scss";

import { React } from "react";
import { useDispatch } from "react-redux";

import { showNewFileModal } from "../../../redux/EditorSlice";
import Button from "../../Button/Button";
import PlusIcon from "../../../assets/icons/plus.svg";
import { useTranslation } from "react-i18next";

const NewComponentButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openNewFileModal = () => {
    dispatch(showNewFileModal());
  };

  return (
    <Button
      buttonText={t("filePanel.newFileButton")}
      ButtonIcon={PlusIcon}
      buttonIconPosition="right"
      onClickHandler={openNewFileModal}
      className="btn--primary proj-new-component-button"
    />
  );
};

export default NewComponentButton;