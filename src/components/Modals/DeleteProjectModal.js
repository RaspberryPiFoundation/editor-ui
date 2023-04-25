import React from "react";
import Modal from 'react-modal';
import { gql, useMutation } from '@apollo/client';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeDeleteProjectModal } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";

// Define mutation
export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(input: {id: $id}) {
      id
    }
  }
`;

export const DeleteProjectModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const isModalOpen = useSelector((state) => state.editor.deleteProjectModalShowing)
  const project = useSelector((state) => state.editor.modals.deleteProject)

  const closeModal = () => dispatch(closeDeleteProjectModal());

  // This can capture data, error, loading as per normal queries, but we're not
  // using them yet.
  const [deleteProjectMutation] = useMutation(DELETE_PROJECT_MUTATION, {refetchQueries: ["ProjectIndexQuery"]})

  const onClickDelete = async () => {
    deleteProjectMutation({variables: {id: project.id}, onCompleted: closeModal})
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('projectList.deleteProjectModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
          <div className='modal-content__header'>
            <h2 className='modal-content__heading'>{t('projectList.deleteProjectModal.heading')}</h2>
            <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
          </div>
          <div className='modal-content__body'>
            <p className='modal-content__text'>{t('projectList.deleteProjectModal.text', {name: project.name})}</p>
          </div>
          <div className='modal-content__buttons' >
            <Button className='btn--danger' buttonText={t('projectList.deleteProjectModal.delete')} onClickHandler={onClickDelete} />
            <Button className='btn--secondary' buttonText={t('projectList.deleteProjectModal.cancel')} onClickHandler={closeModal} />
          </div>
      </Modal>
    </>
  );
}

export default DeleteProjectModal
