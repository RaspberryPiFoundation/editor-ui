import React from "react";
import { gql, useMutation } from '@apollo/client';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeDeleteProjectModal } from "../Editor/EditorSlice";
import Button from "../Button/Button";
import GeneralModal from "./GeneralModal";

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
    <GeneralModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t('projectList.deleteProjectModal.heading')}
      text={[
        {type: 'paragraph', content: t('projectList.deleteProjectModal.text')}
      ]}
      buttons={[
        <Button className='btn--danger' buttonText={t('projectList.deleteProjectModal.delete')} onClickHandler={onClickDelete} />,
        <Button className='btn--secondary' buttonText={t('projectList.deleteProjectModal.cancel')} onClickHandler={closeModal} />
      ]}
      defaultCallback={onClickDelete}
    />
  );
}

export default DeleteProjectModal
