import axios from 'axios';

const host = process.env.REACT_APP_API_ENDPOINT;

export const updateProject = async (project) => {
  return await axios.put(
    `${host}/api/projects/phrases/${project.identifier}`,
    { project: project }
  );
}

export const newProject = async () => {
  return await axios.post(`${host}/api/default_project/`, {}, { 
    headers: {
      'Accept': 'application/json'
    }
  });
}

export const remixProject = async (projectIdentifier) => {
  return await axios.post(
    `${host}/api/projects/phrases/${projectIdentifier}/remix`
  );
}

export const readProject = async (projectIdentifier) => {
  return await axios.get(`${host}/api/projects/phrases/${projectIdentifier}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
}
