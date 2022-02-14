import './NewComponentButton.css';

import {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';

import { addProjectComponent, setNameError } from '../EditorSlice';
import Button from '../../Button/Button'
import NameErrorMessage from '../ErrorMessage/NameErrorMessage';

const allowedExtensions = {
  "python": [
    "py"
  ]
}

const allowedExtensionsString = (projectType) => {
  const extensionsList = allowedExtensions[projectType];
  if (extensionsList.length == 1) {
    return `'.${extensionsList[0]}'`
  } else {
    return `'.` + extensionsList.slice(0,-1).join(`', '.`) + `' or '.` + extensionsList[extensionsList.length-1] + `'`;
  }
}

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
      if (isValidFileName(fileName)) {
        dispatch(addProjectComponent({extension: extension, name: name}));
        closeModal();
      } else if (componentNames.includes(fileName)) {
        dispatch(setNameError("File names must be unique."));
      } else if (!allowedExtensions[projectType].includes(extension)) {
        dispatch(setNameError(`File names must end in ${allowedExtensionsString(projectType)}.`));
      } else {
        dispatch(setNameError("Error"));
      }
    }

    const isValidFileName = (fileName) => {
      const extension = fileName.split('.').slice(1).join('.')
      if (allowedExtensions[projectType].includes(extension) && !componentNames.includes(fileName)) {
        return true;
      } else {
        return false;
      }
    }

    const customStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
      },
    };
  
    return (
      <>
        <Button buttonText='+' onClickHandler={showModal} className="proj-new-component-button" />
  
        <Modal 
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="New File"
          appElement={document.getElementById('root') || undefined}
        >
          <h2>Add a new file to your project</h2>

          <NameErrorMessage />
          <label htmlFor='name'>Name: </label>
          <input type='text' name='name' id='name'></input>
          <Button buttonText='Cancel' onClickHandler={closeModal} />
          <Button buttonText='Save' onClickHandler={createComponent} />
          
        </Modal>
      </>
    );
  }
  
export default NewComponentButton;
