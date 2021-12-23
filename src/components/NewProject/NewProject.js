import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom'
import Button from '../Button/Button'

const NewProject = () => {
  let history = useHistory()

  const handleClick = async () => {
    const host = process.env.REACT_APP_API_ENDPOINT;
    const response = await axios.post(`${host}/api/default_project/`, {},
      { headers: {
              'Accept': 'application/json'
      }},
    );
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
