import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { RemixIcon } from '../../Icons';
import { remixProject, updateProjectName } from '../Editor/EditorSlice';

import './ProjectName.scss';

const ProjectName = () => {
  const project = useSelector((state) => state.editor.project)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch();
  const { t } = useTranslation()
  const nameInput= useRef();

  const onNameChange = () => {
    dispatch(updateProjectName(nameInput.current.value))
  }

  const onClickRemix = async () => {
    if (!project.identifier || !user) {
      return;
    }
    dispatch(remixProject({project: project, user: user}))
  }

  return (
   <div className='project-name'>
    {user && (project.user_id === user.profile.user) ? 
      <input
        className='project-name__input'
        ref={nameInput}
        type='text'
        onChange={onNameChange}
        defaultValue={project.name} /> 
      : user && project.identifier?
      <div className='project-name__remix' onClick={onClickRemix}>
        <RemixIcon />
        <h1>{project.name}</h1>
      </div>
      :
      <div className='project-name__no-auth'>
        <h1>{project.name||t('header.newProject')}</h1>
      </div>
      }
    </div>
  )
};

export default ProjectName;
