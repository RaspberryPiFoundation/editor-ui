import React, { useRef } from 'react';
import { useDispatch } from 'react-redux'
import { updateProjectName } from '../Editor/EditorSlice';

import './ProjectName.scss';

const ProjectName = (props) => {
  const projectName = props.name;
  const dispatch = useDispatch();
  const nameInput= useRef();

  const onNameChange = () => {
    dispatch(updateProjectName(nameInput.current.value))
  }

  return (
      <input className='project-name__input' ref={nameInput} type='text' onChange={onNameChange} defaultValue={projectName} />
  )
};

export default ProjectName;
