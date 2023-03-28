import React from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { gql, useMutation } from '@apollo/client'
import { CloseIcon } from "../../Icons";
import { validateFileName } from "../../utils/componentNameValidation";
import Button from "../Button/Button";
import { closeRenameFileModal } from "../Editor/EditorSlice";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";
import '../../Modal.scss';

export const RENAME_FILE_MUTATION = gql`
  mutation RenameFile($id: String!, $name: String!) {
    updateComponent(input: {id: $id, name: $name}) {
      component {
        id
        name
        updatedAt
      }
    }
  }
`;

const RenameFile = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
//  const projectType = useSelector((state) => state.editor.project.project_type)
//  const projectComponents = useSelector((state) => state.editor.project.components)
  const isModalOpen = useSelector((state) => state.editor.renameFileModalShowing)
  const {name: currentName, extension: currentExtension, componentId} = useSelector((state) => state.editor.modals.renameFile);
//  const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)

  const closeModal = () => {
    dispatch(closeRenameFileModal())
  }

  // This can capture data, error, loading as per normal queries, but we're not
  // using them yet.
  const [renameFileMutation] = useMutation(RENAME_FILE_MUTATION);

  const renameFile = () => {
    const fileName = document.getElementById('name').value
    const name = fileName.split('.')[0];
    const extension = fileName.split('.').slice(1).join('.');
    renameFileMutation({variables: {id: componentId, name: name, extension: extension}, onCompleted: closeModal})
  }

  return (
    <>
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

          <label htmlFor='name'>{t('filePane.renameFileModal.inputLabel')}</label>
          <NameErrorMessage />
          <input type='text' name='name' id='name' defaultValue={`${currentName}.${currentExtension}`}></input>
          <div className='modal-content__buttons' >
            <Button className='btn--secondary' buttonText={t('filePane.renameFileModal.cancel')} onClickHandler={closeModal} />
            <Button className='btn--primary' buttonText={t('filePane.renameFileModal.save')} onClickHandler={renameFile} />
          </div>
      </Modal>
    </>
  );
}

export default RenameFile;
