import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { PencilIcon } from '../../Icons';
import Button from '../Button/Button';
import { updateProjectName } from '../Editor/EditorSlice';

import './ProjectName.scss';

const ProjectName = (props) => {
  const project = useSelector((state) => state.editor.project)
  const dispatch = useDispatch();
  const { t } = useTranslation()
  const nameInput= useRef();
  const [isEditable, setEditable] = useState(false)

  const { projectData } = props;

  useEffect(() => {
    if (isEditable) {
      nameInput.current.focus()
    }
  })

  const updateName = () => {
    setEditable(false)
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
        defaultValue={project.name} />
      :
      <>
        <h1 className='project-name__title'>{projectData.name||t('project.untitled')}</h1>
        <Button className='btn--tertiary project-name__button' label={t('header.buttonLabel')} title={t('header.buttonTitle')} ButtonIcon={PencilIcon} onClickHandler={onEditNameButtonClick} />
      </>
      }
    </div>
  )
};

export default ProjectName;
