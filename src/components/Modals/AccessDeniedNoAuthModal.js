import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import '../../Modal.scss';
import { closeAccessDeniedNoAuthModal } from "../Editor/EditorSlice";
import LoginButton from "../Login/LoginButton";
import GeneralModal from "./GeneralModal";

const AccessDeniedNoAuthModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  
  const isModalOpen = useSelector((state) => state.editor.accessDeniedNoAuthModalShowing)
  const closeModal = () => dispatch(closeAccessDeniedNoAuthModal());

  return (
    <GeneralModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t('project.accessDeniedNoAuthModal.heading')}
      text={[
        {type: 'paragraph', content: t('project.accessDeniedNoAuthModal.text')}
      ]}
      buttons={[
        <LoginButton buttonText={t('project.accessDeniedNoAuthModal.loginButtonText')} className = 'btn--primary'/>,
        <a className='btn btn--secondary' href='https://projects.raspberrypi.org'>{t('project.accessDeniedNoAuthModal.projectsSiteLinkText')}</a>,
        <Button buttonText = {t('project.accessDeniedNoAuthModal.newProject')} className='btn--tertiary' onClickHandler={closeModal}/>
      ]}
    />
  );
}

export default AccessDeniedNoAuthModal;
