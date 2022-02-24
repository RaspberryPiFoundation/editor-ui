import axios from 'axios';

const host = process.env.REACT_APP_API_ENDPOINT;

export const updateProject = () => {

}

export const newProject = () => {

}

export const remixProject = () => {

}

export const readProject = async (projectIdentifier) => {
  return await axios.get(`${host}/api/projects/phrases/${projectIdentifier}`, {
    headers: {
    'Accept': 'application/json'
    }
  });
}
