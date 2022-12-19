import React from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { closeLoginToSaveModal } from "../Editor/EditorSlice";
import DownloadButton from "../Header/DownloadButton";
import LoginButton from "../Login/LoginButton";
import '../../Modal.scss';
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";

const LoginToSaveModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  
  const isModalOpen = useSelector((state) => state.editor.loginToSaveModalShowing)
  const closeModal = () => dispatch(closeLoginToSaveModal());

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel="Login to Save"
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
        <div className='modal-content__header'>
          <h2 className='modal-content__heading'>{t('loginToSaveModal.heading')}</h2>
          <button onClick={closeModal}>
            <CloseIcon/>
          </button>
        </div>

        <p className='modal-content__text'>{t('loginToSaveModal.loginText')}</p>
        <p className='modal-content__text'>{t('loginToSaveModal.downloadText')}</p>

        <div className='modal-content__buttons' >
          <DownloadButton buttonText = {t('loginToSaveModal.downloadButtonText')} className = 'btn--secondary' />
          <LoginButton className='btn--primary' buttonText={t('loginToSaveModal.loginButtonText')} />
        </div>
        <div className='modal-content__links'>
          <Button buttonText = {t('loginToSaveModal.cancel')} className='btn--tertiary' onClickHandler={closeModal}/>
        </div>
        
      </Modal>
    </>
  );
}

export default LoginToSaveModal;
