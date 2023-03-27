import React from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import '../../Modal.scss';
import { closeNotFoundModal, syncProject } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import { legacyDefaultPythonProject } from "../../utils/defaultProjects";

const NotFoundModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user)

  const isModalOpen = useSelector((state) => state.editor.notFoundModalShowing)
  const closeModal = () => dispatch(closeNotFoundModal())

  const createNewProject = async () => {
    if (user) {
      dispatch(syncProject('save')({ project: legacyDefaultPythonProject, accessToken: user.access_token, autosave: false }))
    }
    closeModal()
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
          <h2 className='modal-content__heading'>{t('project.notFoundModal.heading')}</h2>
          <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
        </div>
        <p className='modal-content__text'>{t('project.notFoundModal.text')}</p>

        <div className='modal-content__buttons' >
          <a className='btn btn--secondary' href='https://projects.raspberrypi.org'>{t('project.notFoundModal.projectsSiteLinkText')}</a>
          <Button className='btn--primary' buttonText={t('project.notFoundModal.newProject')} onClickHandler={createNewProject} />
        </div>
      </Modal>
    </>
  );
}

export default NotFoundModal;
