import React from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import '../../Modal.scss';
import { closeAccessDeniedWithAuthModal, syncProject } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import { defaultPythonProject } from "../../utils/defaultProjects";

const AccessDeniedWithAuthModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const user = useSelector((state) => state.auth.user)
  
  const isModalOpen = useSelector((state) => state.editor.accessDeniedWithAuthModalShowing)
  const closeModal = () => dispatch(closeAccessDeniedWithAuthModal());

  const createNewProject = async () => {
    dispatch(syncProject('save')({ project: defaultPythonProject, accessToken: user.access_token, autosave: false }))
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('project.notFoundModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
        <div className='modal-content__header'>
          <h2 className='modal-content__heading'>{t('project.accessDeniedWithAuthModal.heading')}</h2>
          <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
        </div>

        <div className='modal-content__body'>
          <p className='modal-content__text'>{t('project.accessDeniedWithAuthModal.text')}</p>
        </div>

        <div className='modal-content__buttons' >
          <Button className='btn--primary' buttonText={t('project.accessDeniedWithAuthModal.newProject')} onClickHandler={createNewProject} />
          <a className='btn btn--secondary' href='https://projects.raspberrypi.org'>{t('project.accessDeniedWithAuthModal.projectsSiteLinkText')}</a>
        </div>
      </Modal>
    </>
  );
}

export default AccessDeniedWithAuthModal;
