import React, { useState } from "react";
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

  const [projectName, setProjectName] = useState(project.name)

  const onCompleted = () => {
    console.log('completed')
    closeModal()
    showRenamedMessage()
  }

  // This can capture data, error, loading as per normal queries, but we're not
  // using them yet.
  const [renameProjectMutation] = useMutation(RENAME_PROJECT_MUTATION);

  const renameProject = () => {
    console.log('renaming')
    renameProjectMutation({variables: {id: project.id, name: projectName}, onCompleted: onCompleted})
  }

  return (
    <InputModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t('projectList.renameProjectModal.heading')}
      inputs={[
        {
          label: t('projectList.renameProjectModal.inputLabel'),
          value: projectName,
          setValue: setProjectName
        }
      ]}
      defaultCallback={renameProject}
      buttons={[
        <Button key='rename' className='btn--primary' buttonText={t('projectList.renameProjectModal.save')} onClickHandler={renameProject} />,
        <Button key='close' className='btn--secondary' buttonText={t('projectList.renameProjectModal.cancel')} onClickHandler={closeModal} />
      ]}
    />
  );
}

export default RenameProjectModal
