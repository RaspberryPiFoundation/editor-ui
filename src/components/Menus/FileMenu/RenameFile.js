import React, { useState } from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { PencilIcon } from "../../../Icons";
import { validateFileName } from "../../../utils/componentNameValidation";
import Button from "../../Button/Button";
import { setNameError, updateComponentName } from "../../Editor/EditorSlice";
import NameErrorMessage from "../../Editor/ErrorMessage/NameErrorMessage";
import '../../../Modal.scss';
import { useCookies } from "react-cookie";

const RenameFile = (props) => {
  const {currentName, currentExtension, fileKey} = props
  const [modalIsOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const projectType = useSelector((state) => state.editor.project.project_type)
  const projectComponents = useSelector((state) => state.editor.project.components);
  const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)

  const [cookies] = useCookies(['fontSize', 'theme'])
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)
  const theme = isDarkMode ? "dark" : "light"

  const closeModal = () => setIsOpen(false);
  const showModal = () => {
    dispatch(setNameError(""));
    setIsOpen(true)
  };

  const renameComponent = () => {
    const fileName = document.getElementById('name').value
    const name = fileName.split('.')[0];
    const extension = fileName.split('.').slice(1).join('.');

    validateFileName(fileName, projectType, componentNames, dispatch, () => {
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
          <h2>Rename File</h2>

          <label htmlFor='name'>Name your file</label>
          <NameErrorMessage />
          <input type='text' name='name' id='name' defaultValue={`${currentName}.${currentExtension}`}></input>
          <div className='modal__buttons' >
            <Button buttonText='Cancel' className='btn--secondary' onClickHandler={closeModal} />
            <Button buttonText='Save' onClickHandler={renameComponent} />
          </div>
      </Modal>
    </>
  );
}

export default RenameFile;
