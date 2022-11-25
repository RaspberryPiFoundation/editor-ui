import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom';
import { RemixIcon } from '../../Icons';
import { remixProject } from '../../utils/apiCallHandler';
import { showRemixedMessage } from '../../utils/Notifications';
import { createRemix, setProjectLoaded, updateProjectName } from '../Editor/EditorSlice';

import './ProjectName.scss';

const ProjectName = () => {
  const project = useSelector((state) => state.editor.project)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch();
  let history = useHistory()
  const { t } = useTranslation()
  const nameInput= useRef();

  const onNameChange = () => {
    dispatch(updateProjectName(nameInput.current.value))
  }

  const onClickRemix = async () => {
    if (!project.identifier || !user) {
      return;
    }

    dispatch(createRemix({project: project, user: user}))

    // const response = await remixProject(project, user.access_token)

    // if(response.status === 200) {
    //   localStorage.removeItem(project.identifier || 'project')
    //   const identifier = response.data.identifier;
    //   const project_type = response.data.project_type;
    //   dispatch(setProjectLoaded(false));
    //   history.push(`/${project_type}/${identifier}`)
    //   showRemixedMessage()
    // }
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
