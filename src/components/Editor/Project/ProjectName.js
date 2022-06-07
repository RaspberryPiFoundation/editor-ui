import './Project.scss';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux'
import { updateProjectName } from '../EditorSlice';

const ProjectName = (props) => {
  const projectName = props.name;
  const dispatch = useDispatch();
  const nameInput= useRef();

  const onNameChange = () => {
    dispatch(updateProjectName(nameInput.current.value))
  }

  return (
    <div>
      Project Name:
      <input ref={nameInput} type='text' onChange={onNameChange} defaultValue={projectName} />
    </div>
  )
};

export default ProjectName;
