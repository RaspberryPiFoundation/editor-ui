import React, { useCallback } from 'react'
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

  const nameInput = useCallback((node) => {
    if (node) {
      node.focus()
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      createComponent()
    }
  }

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

  const fileNameExamples = (projectType === 'python' ? t('filePane.newFileModal.helpTextExamplePython') : t('filePane.newFileModal.helpTextExampleHTML'))

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
        <div>
          <label htmlFor='name'>{t('filePane.newFileModal.inputLabel')}</label>
          <p className='modal-content__help-text'>{t('filePane.newFileModal.helpText')}, {fileNameExamples}</p>
        </div>
        <div>
          <NameErrorMessage />
          <input ref={nameInput} type='text' name='name' id='name' onKeyDown={onKeyDown}></input>
        </div>
      </div>

      <div className='modal-content__buttons'>
        <Button className='btn--primary' buttonText={t('filePane.newFileModal.addFile')} onClickHandler={createComponent} />
        <Button className='btn--secondary' buttonText={t('filePane.newFileModal.cancel')} onClickHandler={closeModal} />
      </div>
    </Modal>
  )
}

export default NewFileModal
