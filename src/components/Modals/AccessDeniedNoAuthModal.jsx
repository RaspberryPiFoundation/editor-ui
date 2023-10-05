import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import "../../assets/stylesheets/Modal.scss";
import { closeAccessDeniedNoAuthModal } from "../Editor/EditorSlice";
import LoginButton from "../Login/LoginButton";
import GeneralModal from "./GeneralModal";
import { login } from "../../utils/login";

const AccessDeniedNoAuthModal = (props) => {
  const {
    buttons = null,
    text = null,
    withCloseButton = true,
    withClickToClose = true,
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isModalOpen = useSelector(
    (state) => state.editor.accessDeniedNoAuthModalShowing,
  );
  const accessDeniedData = useSelector(
    (state) => state.editor.modals.accessDenied,
  );

  const closeModal = () => dispatch(closeAccessDeniedNoAuthModal());

  const defaultCallback = () => {
    login({ accessDeniedData });
  };

  return (
    <GeneralModal
      isOpen={isModalOpen}
      closeModal={withClickToClose ? closeModal : null}
      withCloseButton={withCloseButton}
      heading={t("project.accessDeniedNoAuthModal.heading")}
      text={
        text || [
          {
            type: "paragraph",
            content: t("project.accessDeniedNoAuthModal.text"),
          },
        ]
      }
      buttons={
        buttons || [
          <LoginButton
            key="login"
            buttonText={t("project.accessDeniedNoAuthModal.loginButtonText")}
            className="btn--primary"
          />,
          <a
            key="link"
            className="btn btn--secondary"
            href="https://projects.raspberrypi.org"
          >
            {t("project.accessDeniedNoAuthModal.projectsSiteLinkText")}
          </a>,
          <Button
            key="close"
            buttonText={t("project.accessDeniedNoAuthModal.newProject")}
            className="btn--tertiary"
            onClickHandler={closeModal}
          />,
        ]
      }
      defaultCallback={defaultCallback}
    />
  );
};

export default AccessDeniedNoAuthModal;
