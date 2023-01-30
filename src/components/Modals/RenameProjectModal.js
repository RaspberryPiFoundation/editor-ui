import React from "react";
import Modal from 'react-modal';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeRenameProjectModal, syncProject } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";

const RenameProjectModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const isModalOpen = useSelector((state) => state.editor.renameProjectModalShowing)
  const project = useSelector((state) => state.editor.modals.renameProject)
  const user = useSelector((state) => state.auth.user)

  const closeModal = () => dispatch(closeRenameProjectModal());

  const renameProject = () => {
    const newName = document.getElementById('name').value
    dispatch(syncProject('save')({project: {...project, name: newName}, accessToken: user.access_token, autosave: false}))
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('projectList.renameProjectModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
          <div className='modal-content__header'>
            <h2 className='modal-content__heading'>{t('projectList.renameProjectModal.heading')}</h2>
            <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
          </div>

          <label htmlFor='name'>{t('projectList.renameProjectModal.inputLabel')}</label>
          <input type='text' name='name' id='name' defaultValue={project.name}></input>
          <div className='modal-content__buttons' >
            <Button className='btn--secondary' buttonText={t('projectList.renameProjectModal.cancel')} onClickHandler={closeModal} />
            <Button className='btn--primary' buttonText={t('projectList.renameProjectModal.save')} onClickHandler={renameProject} />
          </div>
      </Modal>
    </>
  );
}

export default RenameProjectModal
