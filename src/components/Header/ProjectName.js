import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon } from '../../Icons';
import Button from '../Button/Button';
import { gql, useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { updateProjectName } from '../Editor/EditorSlice';

import './ProjectName.scss';

export const PROJECT_NAME_FRAGMENT = gql`
  fragment ProjectNameFragment on Project {
    id
    name
  }
`

export const RENAME_PROJECT_MUTATION = gql`
  mutation RenameProject($id: String!, $name: String!) {
    updateProject(input: {id: $id, name: $name}) {
      project {
        id
        name
      }
    }
  }
`

export const ProjectName = (props) => {
  const { t } = useTranslation()
  const { project } = props
  const localProject = useSelector((state) => state.editor.project)
  const dispatch = useDispatch()
  const nameInput = useRef()
  const [isEditable, setEditable] = useState(false)
  const [renameProjectMutation] = useMutation(RENAME_PROJECT_MUTATION)
  const projectName = project.id ? project.name : localProject.name

  useEffect(() => {
    if (isEditable) {
      nameInput.current.focus()
    }
  })

  const updateName = () => {
    setEditable(false)
    if (project.id) {
      renameProjectMutation({
        variables: {id: project.id, name: nameInput.current.value},
        optimisticResponse: {
          __typename: "Mutation",
          updateProject: {
            __typename: "UpdateProjectPayload",
            project: {
              id: project.id,
              name: nameInput.current.value,
              __typename: "Project"
            }
          }
        }
      })
    }
    dispatch(updateProjectName(nameInput.current.value))
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
        defaultValue={projectName} />
      :
      <>
        <h1 className='project-name__title'>{projectName||t('project.untitled')}</h1>
        <Button className='btn--tertiary project-name__button' label={t('header.buttonLabel')} title={t('header.buttonTitle')} ButtonIcon={PencilIcon} onClickHandler={onEditNameButtonClick} />
      </>
      }
    </div>
  )
};
