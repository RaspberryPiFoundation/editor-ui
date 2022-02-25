import React from 'react';
import { useHistory } from 'react-router-dom'
import Button from '../Button/Button'
import { newProject } from '../../utils/apiCallHandler';

const NewProject = () => {
  let history = useHistory()

  const handleClick = async () => {
    const response = await newProject()

    const identifier = response.data.identifier;
    const project_type = response.data.project_type;
    history.push(`/${project_type}/${identifier}`)
  }

  return (
    <div className='main-container'>
      <h1>Python Editor</h1>
      <Button onClickHandler={handleClick} buttonText="Create a new project" leftAlign={true} />
    </div>
  )
};

export default NewProject;
