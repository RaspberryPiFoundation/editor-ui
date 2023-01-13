import React from "react";
import Modal from 'react-modal';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeDeleteProjectModal, syncProject } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";

const DeleteProjectModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const isModalOpen = useSelector((state) => state.editor.deleteProjectModalShowing)
  const project = useSelector((state) => state.editor.modals.deleteProject)
  const user = useSelector((state) => state.auth.user)

  const closeModal = () => dispatch(closeDeleteProjectModal());

  const onClickDelete = async () => {
    dispatch(syncProject('delete')({identifier: project.identifier, accessToken: user.access_token}));
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('projectList.deleteProjectModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
          <div className='modal-content__header'>
            <h2 className='modal-content__heading'>{t('projectList.deleteProjectModal.heading')}</h2>
            <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
          </div>
          <p className='modal-content__text'>{t('projectList.deleteProjectModal.text', {name: project.name})}</p>
          <div className='modal-content__buttons' >
            <Button className='btn--secondary' buttonText={t('projectList.deleteProjectModal.cancel')} onClickHandler={closeModal} />
            <Button className='btn--danger' buttonText={t('projectList.deleteProjectModal.delete')} onClickHandler={onClickDelete} />
          </div>
      </Modal>
    </>
  );
}

export default DeleteProjectModal
