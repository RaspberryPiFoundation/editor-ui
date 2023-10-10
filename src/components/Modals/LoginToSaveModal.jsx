import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { closeLoginToSaveModal } from "../../redux/EditorSlice";
import DownloadButton from "../DownloadButton/DownloadButton";
import LoginButton from "../Login/LoginButton";
import "../../assets/stylesheets/Modal.scss";
import Button from "../Button/Button";
import GeneralModal from "./GeneralModal";
import { login } from "../../utils/login";
import { useLocation } from "react-router-dom";

const LoginToSaveModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const project = useSelector((state) => state.editor.project);
  const isModalOpen = useSelector(
    (state) => state.editor.loginToSaveModalShowing,
  );
  const closeModal = () => dispatch(closeLoginToSaveModal());

  const defaultCallback = () => {
    login({ project, location, triggerSave: true });
  };

  return (
    <GeneralModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t("loginToSaveModal.heading")}
      text={[
        { type: "paragraph", content: t("loginToSaveModal.loginText") },
        { type: "paragraph", content: t("loginToSaveModal.downloadText") },
      ]}
      buttons={[
        <LoginButton
          key="login"
          className="btn--primary"
          buttonText={t("loginToSaveModal.loginButtonText")}
          triggerSave
        />,
        <DownloadButton
          key="download"
          buttonText={t("loginToSaveModal.downloadButtonText")}
          className="btn--secondary"
        />,
        <Button
          key="close"
          buttonText={t("loginToSaveModal.cancel")}
          className="btn--tertiary"
          onClickHandler={closeModal}
        />,
      ]}
      defaultCallback={defaultCallback}
    />
  );
};

export default LoginToSaveModal;
