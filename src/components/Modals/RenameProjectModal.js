import React from "react";
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

  const onCompleted = () => {
    closeModal()
    showRenamedMessage()
  }

  const [renameProjectMutation, { data, loading, error }] = useMutation(RENAME_PROJECT_MUTATION);

  const renameProject = () => {
    const newName = document.getElementById('name').value
    renameProjectMutation({variables: {id: project.id, name: newName}, onCompleted: onCompleted})
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

          <label htmlFor='name'>{t('projectList.renameProjectModal.inputLabel')}</label>
          <input type='text' name='name' id='name' defaultValue={project.name}></input>
          <div className='modal-content__buttons' >
            <Button className='btn--secondary' buttonText={t('projectList.renameProjectModal.cancel')} onClickHandler={closeModal} />
            <Button className='btn--primary' buttonText={t('projectList.renameProjectModal.save')} onClickHandler={renameProject} />
          </div>
      </Modal>
    </>
  );
}

export default RenameProjectModal
