import React, { useState } from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon, PencilIcon } from "../../Icons";
import { validateFileName } from "../../utils/componentNameValidation";
import Button from "../Button/Button";
import { setNameError, updateComponentName } from "../Editor/EditorSlice";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";
import '../../Modal.scss';

const RenameFile = (props) => {
  const {currentName, currentExtension, fileKey} = props
  const [modalIsOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const projectType = useSelector((state) => state.editor.project.project_type)
  const projectComponents = useSelector((state) => state.editor.project.components);
  const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)

  const closeModal = () => setIsOpen(false);
  const showModal = () => {
    dispatch(setNameError(""));
    setIsOpen(true)
  };

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
    <>
      <button onClick={showModal}><PencilIcon /></button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className='modal__content'
        overlayClassName='modal__overlay'
        contentLabel="Rename File"
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
          <div className='modal__header'>
            <h2>{t('filePane.renameFileModal.heading')}</h2>
            <button onClick={closeModal}>
              <CloseIcon/>
            </button>
          </div>

          <label htmlFor='name'>{t('filePane.renameFileModal.inputLabel')}</label>
          <NameErrorMessage />
          <input type='text' name='name' id='name' defaultValue={`${currentName}.${currentExtension}`}></input>
          <div className='modal__buttons' >
            <Button buttonText={t('filePane.renameFileModal.cancel')} className='btn--secondary' onClickHandler={closeModal} />
            <Button buttonText={t('filePane.renameFileModal.save')} onClickHandler={renameComponent} />
          </div>
      </Modal>
    </>
  );
}

export default RenameFile;
