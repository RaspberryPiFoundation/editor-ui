import './NewComponentButton.scss';

import {React, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';

import { addProjectComponent, setNameError } from '../EditorSlice';
import Button from '../../Button/Button'
import NameErrorMessage from '../ErrorMessage/NameErrorMessage';
import { NewFileIcon } from '../../../Icons';
import { validateFileName } from '../../../utils/componentNameValidation';
import { modalCustomStyles } from '../../../modalCustomStyles';

const NewComponentButton = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
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
      validateFileName(fileName, projectType, componentNames, dispatch, () => {
        dispatch(addProjectComponent({extension: extension, name: name}));
        closeModal();
      })
    }

    return (
      <>
        <Button buttonText={<><NewFileIcon />Add file</>} onClickHandler={showModal} className="proj-new-component-button" />

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={modalCustomStyles}
          contentLabel="New File"
          appElement={document.getElementById('root') || undefined}
        >
          <h2>Add a new file to your project</h2>

          <label htmlFor='name'>Name your file</label>
          <NameErrorMessage />
          <input type='text' name='name' id='name'></input>
          <div className='modal__buttons'>
            <Button className='btn--secondary' buttonText='Cancel' onClickHandler={closeModal} />
            <Button buttonText='Save' onClickHandler={createComponent} />
          </div>

        </Modal>
      </>
    );
  }

export default NewComponentButton;
