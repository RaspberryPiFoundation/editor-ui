import './NewComponentButton.scss';

import {React, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';

import { addProjectComponent, openFile, setNameError } from '../EditorSlice';
import Button from '../../Button/Button'
import NameErrorMessage from '../ErrorMessage/NameErrorMessage';
import { CloseIcon, PlusIcon } from '../../../Icons';
import { validateFileName } from '../../../utils/componentNameValidation';
import { useTranslation } from 'react-i18next';

const NewComponentButton = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const { t } = useTranslation()
    const dispatch = useDispatch();
    const projectType = useSelector((state) => state.editor.project.project_type)
    const projectComponents = useSelector((state) => state.editor.project.components);
    const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)

    const closeModal = () => setIsOpen(false);
    const showModal = () => {
      dispatch(setNameError(""));
      setIsOpen(true)
    };
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
      <div>
        <Button buttonText={t('filePane.newFileButton')} ButtonIcon={PlusIcon} buttonOuter onClickHandler={showModal} className="btn--primary btn--small proj-new-component-button" />

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="New File"
          className='modal-content'
          overlayClassName='modal-overlay'
          parentSelector={() => document.querySelector('#app')}
          appElement={document.getElementById('app') || undefined}
        >
          <div className='modal-content__header'>
            <h2 className='modal-content__heading'>{t('filePane.newFileModal.heading')}</h2>
            <button onClick={closeModal}>
              <CloseIcon/>
            </button>
          </div>

          <label htmlFor='name'>{t('filePane.newFileModal.inputLabel')}</label>
          <NameErrorMessage />
          <input type='text' name='name' id='name'></input>
          <div className='modal-content__buttons'>
            <Button className='btn--secondary' buttonText={t('filePane.newFileModal.cancel')} onClickHandler={closeModal} />
            <Button className='btn--primary' buttonText={t('filePane.newFileModal.save')} onClickHandler={createComponent} />
          </div>

        </Modal>
      </div>
    );
  }

export default NewComponentButton;
