import React from "react";
import { gql, useMutation } from '@apollo/client';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeRenameProjectModal } from "../Editor/EditorSlice";
import { showRenamedMessage } from '../../utils/Notifications';
import Button from "../Button/Button";
import InputModal from "./InputModal";

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

  // This can capture data, error, loading as per normal queries, but we're not
  // using them yet.
  const [renameProjectMutation] = useMutation(RENAME_PROJECT_MUTATION);

  const renameProject = () => {
    const newName = document.getElementById('name').value
    renameProjectMutation({variables: {id: project.id, name: newName}, onCompleted: onCompleted})
  }

  return (
    <InputModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t('projectList.renameProjectModal.heading')}
      // inputLabel={t('projectList.renameProjectModal.inputLabel')}
      // inputDefaultValue={project.name}
      inputs={[
        {
          label: t('projectList.renameProjectModal.inputLabel'),
          defaultValue: project.name
        }
      ]}
      defaultCallback={renameProject}
      buttons={[
        <Button className='btn--primary' buttonText={t('projectList.renameProjectModal.save')} onClickHandler={renameProject} />,
        <Button className='btn--secondary' buttonText={t('projectList.renameProjectModal.cancel')} onClickHandler={closeModal} />
      ]}
    />
  );
}

export default RenameProjectModal
