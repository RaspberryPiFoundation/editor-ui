import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom'
import Button from '../Button/Button'

const NewProject = () => {
  let history = useHistory()

  const handleClick = async () => {
    const response = await axios.post("/api/default_project/");
    const identifier = response.data.identifier;
    history.push(`/python/${identifier}`)
  }

  return (
    <div className='main-container'>
      <h1>Python Editor</h1>
      <Button onClickHandler={handleClick} buttonText="Create a new project" leftAlign={true} />
    </div>
  )
};

export default NewProject;
