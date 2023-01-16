import React from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import '../../Modal.scss';
import { closeAccessDeniedNoAuthModal } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import LoginButton from "../Login/LoginButton";

const AccessDeniedNoAuthModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  
  const isModalOpen = useSelector((state) => state.editor.accessDeniedNoAuthModalShowing)
  const closeModal = () => dispatch(closeAccessDeniedNoAuthModal());

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('project.accessDeniedNoAuthModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
        <div className='modal-content__header'>
          <h2 className='modal-content__heading'>{t('project.accessDeniedNoAuthModal.heading')}</h2>
          <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
        </div>
        <p className='modal-content__text'>{t('project.accessDeniedNoAuthModal.text')}</p>

        <div className='modal-content__buttons' >
          <a className='btn btn--secondary' href='https://projects.raspberrypi.org'>{t('project.accessDeniedNoAuthModal.projectsSiteLinkText')}</a>
          <LoginButton className='btn--primary' buttonText={t('project.accessDeniedNoAuthModal.loginButtonText')} />
        </div>
        <div className='modal-content__links'>
          <Button buttonText = {t('project.accessDeniedNoAuthModal.newProject')} className='btn--tertiary' onClickHandler={closeModal}/>
        </div>
      </Modal>
    </>
  );
}

export default AccessDeniedNoAuthModal;
