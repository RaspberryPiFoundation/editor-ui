import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon } from '../../Icons';
import Button from '../Button/Button';
import { gql, useMutation } from '@apollo/client';

import './ProjectName.scss';

const RENAME_PROJECT_MUTATION = gql`
  mutation RenameProject($id: String!, $name: String!) {
    updateProject(input: {id: $id, name: $name}) {
      project {
        id
        name
      }
    }
  }
`

const ProjectName = (props) => {
  const { t } = useTranslation()
  const { project } = props;
  const nameInput = useRef();
  const [isEditable, setEditable] = useState(false)
  const [renameProjectMutation] = useMutation(RENAME_PROJECT_MUTATION)

  useEffect(() => {
    if (isEditable) {
      nameInput.current.focus()
    }
  })

  // TODO: Fix name to local state when not logged in (ie. project is not saved in DB)
  const updateName = () => {
    setEditable(false)
    renameProjectMutation({
      variables: {id: project.id, name: nameInput.current.value},
      optimisticResponse: {
        __typename: "Mutation",
        updateProject: {
          project: {
            id: project.id,
            name: nameInput.current.value,
            __typename: "Project"
          }
        }
      }
    })
  }

  const onEditNameButtonClick = () => {
    setEditable(true)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      nameInput.current.blur()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setEditable(false)
    }
  }

  return (
   <div className='project-name'>
    {isEditable ? 
      <input
        className='project-name__input'
        ref={nameInput}
        type='text'
        onBlur={updateName}
        onKeyDown={handleKeyDown}
        defaultValue={project.name} />
      :
      <>
        <h1 className='project-name__title'>{project.name||t('project.untitled')}</h1>
        <Button className='btn--tertiary project-name__button' label={t('header.buttonLabel')} title={t('header.buttonTitle')} ButtonIcon={PencilIcon} onClickHandler={onEditNameButtonClick} />
      </>
      }
    </div>
  )
};

export default ProjectName;
