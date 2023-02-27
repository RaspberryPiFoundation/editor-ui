import React from "react";
import Modal from 'react-modal';
import { gql, useMutation } from '@apollo/client';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeDeleteProjectModal } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";

// Define mutation
const DELETE_PROJECT = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(input: {id: $id}) {
      id
    }
  }
`;

const DeleteProjectModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const isModalOpen = useSelector((state) => state.editor.deleteProjectModalShowing)
  const project = useSelector((state) => state.editor.modals.deleteProject)

  const closeModal = () => dispatch(closeDeleteProjectModal());

  const [deleteProjectMutation, { data, loading, error }] = useMutation(DELETE_PROJECT, {refetchQueries: ["ProjectIndexQuery"]})

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
          <p className='modal-content__text'>{t('projectList.deleteProjectModal.text', {name: project.name})}</p>
          <div className='modal-content__buttons' >
            <Button className='btn--secondary' buttonText={t('projectList.deleteProjectModal.cancel')} onClickHandler={closeModal} />
            <Button className='btn--danger' buttonText={t('projectList.deleteProjectModal.delete')} onClickHandler={onClickDelete} />
          </div>
      </Modal>
    </>
  );
}

export default DeleteProjectModal
