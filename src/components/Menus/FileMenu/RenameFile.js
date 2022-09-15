import React, { useState } from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { PencilIcon } from "../../../Icons";
import Button from "../../Button/Button";
import { addProjectComponent, setNameError, updateComponentName } from "../../Editor/EditorSlice";
import NameErrorMessage from "../../Editor/ErrorMessage/NameErrorMessage";

const RenameFile = (props) => {
  const {currentName, currentExtension, fileKey} = props
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

  const allowedExtensions = {
    "python": [
      "py",
      "csv",
      "txt"
    ]
  }

  const allowedExtensionsString = (projectType) => {
    const extensionsList = allowedExtensions[projectType];
    if (extensionsList.length === 1) {
      return `'.${extensionsList[0]}'`
    } else {
      return `'.` + extensionsList.slice(0,-1).join(`', '.`) + `' or '.` + extensionsList[extensionsList.length-1] + `'`;
    }
  }

  const renameComponent = () => {
    const fileName = document.getElementById('name').value
    const name = fileName.split('.')[0];
    const extension = fileName.split('.').slice(1).join('.');
    if (isValidFileName(fileName)) {
      dispatch(updateComponentName({key: fileKey, extension: extension, name: name}));
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
    if ((allowedExtensions[projectType].includes(extension) && !componentNames.includes(fileName)) || fileName === `${currentName}.${currentExtension}`) {
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
    overlay: {
      zIndex: 1000
    }
  };

  return (
    <>
      <button onClick={showModal}><PencilIcon /></button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Rename File"
        appElement={document.getElementById('root') || undefined}
      >
        <h2>Rename File</h2>

        <NameErrorMessage />
        <label htmlFor='name'>Name: </label>
        <input type='text' name='name' id='name' defaultValue={`${currentName}.${currentExtension}`}></input>
        <Button buttonText='Cancel' onClickHandler={closeModal} />
        <Button buttonText='Save' onClickHandler={renameComponent} />

      </Modal>
    </>
  );
}

export default RenameFile;
