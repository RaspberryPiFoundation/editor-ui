import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom';
import { RemixIcon } from '../../Icons';
import { remixProject } from '../../utils/apiCallHandler';
import { setProjectLoaded, updateProjectName } from '../Editor/EditorSlice';

import './ProjectName.scss';

const ProjectName = () => {
  const project = useSelector((state) => state.editor.project)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch();
  let history = useHistory()
  const nameInput= useRef();

  const onNameChange = () => {
    dispatch(updateProjectName(nameInput.current.value))
  }

  const onClickRemix = async () => {
    window.plausible('RemixClick')
    
    if (!project.identifier || !user) {
      return;
    }

    const response = await remixProject(project, user.access_token)

    const identifier = response.data.identifier;
    const project_type = response.data.project_type;
    dispatch(setProjectLoaded(false));
    history.push(`/${project_type}/${identifier}`)
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
      : user && project.name?
      <div className='project-name__remix' onClick={onClickRemix}>
        <RemixIcon />
        <h1>{project.name}</h1>
      </div>
      :
      <div className='project-name__no-auth'>
        <h1>{project.name||"New Project"}</h1>
      </div>
      }
    </div>
  )
};

export default ProjectName;
