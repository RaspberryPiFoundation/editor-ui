import React, { useCallback } from "react";
import Modal from 'react-modal';
import { gql, useMutation } from '@apollo/client';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeRenameProjectModal } from "../Editor/EditorSlice";
import { showRenamedMessage } from '../../utils/Notifications';
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";

export const RENAME_PROJECT_MUTATION = gql`
  mutation RenameProject($id: String!, $name: String!) {
    updateProject(input: {id: $id, name: $name}) {
      project {
        id
        name
        updatedAt
      }
    }
  }
`;

export const RenameProjectModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const isModalOpen = useSelector((state) => state.editor.renameProjectModalShowing)
  const project = useSelector((state) => state.editor.modals.renameProject)
  const closeModal = () => dispatch(closeRenameProjectModal())

  const nameInput = useCallback((node) => {
    if (node) {
      node.select()
    }
  })

  const onCompleted = () => {
    closeModal()
    showRenamedMessage()
  }

  // This can capture data, error, loading as per normal queries, but we're not
  // using them yet.
  const [renameProjectMutation] = useMutation(RENAME_PROJECT_MUTATION);

  const renameProject = () => {
    const newName = document.getElementById('name').value
    renameProjectMutation({variables: {id: project.id, name: newName}, onCompleted: onCompleted})
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      renameProject()
    }
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('projectList.renameProjectModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
          <div className='modal-content__header'>
            <h2 className='modal-content__heading'>{t('projectList.renameProjectModal.heading')}</h2>
            <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
          </div>

          <div className='modal-content__body'>
            <label htmlFor='name'>{t('projectList.renameProjectModal.inputLabel')}</label>
            <input type='text' ref={nameInput} name='name' id='name' defaultValue={project.name} onKeyDown={onKeyDown}></input>
          </div>
          
          <div className='modal-content__buttons'>
            <Button className='btn--primary' buttonText={t('projectList.renameProjectModal.save')} onClickHandler={renameProject} />
            <Button className='btn--secondary' buttonText={t('projectList.renameProjectModal.cancel')} onClickHandler={closeModal} />
          </div>
      </Modal>
    </>
  );
}

export default RenameProjectModal
