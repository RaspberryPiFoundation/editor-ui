import React, { useCallback } from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../Icons";
import { validateFileName } from "../../utils/componentNameValidation";
import Button from "../Button/Button";
import { closeRenameFileModal, updateComponentName } from "../Editor/EditorSlice";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";
import '../../Modal.scss';

const RenameFile = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const projectType = useSelector((state) => state.editor.project.project_type)
  const projectComponents = useSelector((state) => state.editor.project.components)
  const isModalOpen = useSelector((state) => state.editor.renameFileModalShowing)
  const {name: currentName, ext: currentExtension, fileKey} = useSelector((state) => state.editor.modals.renameFile);
  const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)

  const closeModal = () => dispatch(closeRenameFileModal());

  const nameInput = useCallback((node) => {
    if (node) {
      node.select()
    }
  })

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      renameComponent()
    }
  }

  const renameComponent = () => {
    const fileName = document.getElementById('name').value
    const name = fileName.split('.')[0];
    const extension = fileName.split('.').slice(1).join('.');

    validateFileName(fileName, projectType, componentNames, dispatch, t, () => {
      dispatch(updateComponentName({key: fileKey, extension: extension, name: name}));
      closeModal();
    }, `${currentName}.${currentExtension}`)
  }

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      className='modal-content'
      overlayClassName='modal-overlay'
      contentLabel="Rename file"
      parentSelector={() => document.querySelector('#app')}
      appElement={document.getElementById('app') || undefined}
    >
        <div className='modal-content__header'>
          <h2 className='modal-content__heading'>{t('filePane.renameFileModal.heading')}</h2>
          <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
        </div>

        <div className='modal-content__body'>
          <label htmlFor='name'>{t('filePane.renameFileModal.inputLabel')}</label>
          <div>
            <NameErrorMessage />
            <input type='text' ref={nameInput} name='name' id='name' defaultValue={`${currentName}.${currentExtension}`} onKeyDown={onKeyDown}></input>
          </div>
        </div>

        <div className='modal-content__buttons' >
          <Button className='btn--primary' buttonText={t('filePane.renameFileModal.save')} onClickHandler={renameComponent} />
          <Button className='btn--secondary' buttonText={t('filePane.renameFileModal.cancel')} onClickHandler={closeModal} />
        </div>
    </Modal>
  );
}

export default RenameFile;
