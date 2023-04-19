import React from 'react'
import Modal from 'react-modal';

import NameErrorMessage from '../Editor/ErrorMessage/NameErrorMessage'
import { CloseIcon } from '../../Icons'
import Button from '../Button/Button'
import { addProjectComponent, closeNewFileModal, openFile } from '../Editor/EditorSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { validateFileName } from '../../utils/componentNameValidation';

const NewFileModal = () => {

  const { t } = useTranslation()
  const dispatch = useDispatch();
  const projectType = useSelector((state) => state.editor.project.project_type)
  const projectComponents = useSelector((state) => state.editor.project.components);
  const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)

  const isModalOpen = useSelector((state) => state.editor.newFileModalShowing)
  const closeModal = () => dispatch(closeNewFileModal())

  const createComponent = () => {
    const fileName = document.getElementById('name').value
    const name = fileName.split('.')[0];
    const extension = fileName.split('.').slice(1).join('.');
    validateFileName(fileName, projectType, componentNames, dispatch, t, () => {
      dispatch(addProjectComponent({extension: extension, name: name}));
      dispatch(openFile(fileName))
      closeModal();
    })
  }

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      contentLabel="New File"
      className='modal-content'
      overlayClassName='modal-overlay'
      parentSelector={() => document.querySelector('#app')}
      appElement={document.getElementById('app') || undefined}
    >
      <div className='modal-content__header'>
        <h2 className='modal-content__heading'>{t('filePane.newFileModal.heading')}</h2>
        <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
      </div>

      <div className='modal-content__body'>
        <label htmlFor='name'>{t('filePane.newFileModal.inputLabel')}</label>
        <NameErrorMessage />
        <input type='text' name='name' id='name'></input>
      </div>

      <div className='modal-content__buttons'>
        <Button className='btn--primary' buttonText={t('filePane.newFileModal.save')} onClickHandler={createComponent} />
        <Button className='btn--secondary' buttonText={t('filePane.newFileModal.cancel')} onClickHandler={closeModal} />
      </div>

    </Modal>
  )
}

export default NewFileModal
