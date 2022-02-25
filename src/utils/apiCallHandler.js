import axios from 'axios';

const host = process.env.REACT_APP_API_ENDPOINT;

const get = async (url, headers) => {
  return await axios.get(url, headers);
}

const post = async (url, body, headers) => {
  return await axios.post(url, body, headers);
}

const put = async (url, body, headers) => {
  return await axios.put(url, body, headers)
}

const headers = () => {
    var headersHash = {'Accept': 'application/json'}
    return {headers: headersHash}
}

export const updateProject = async (project) => {
  return await put(
    `${host}/api/projects/phrases/${project.identifier}`,
    { project: project }, 
    headers()
  );
}

export const newProject = async () => {
  return await post(`${host}/api/default_project/`, {}, headers());
}

export const remixProject = async (projectIdentifier, accessToken) => {
  return await post(`${host}/api/projects/phrases/${projectIdentifier}/remix`, {remix: {user_id: accessToken}}, headers());
}

export const readProject = async (projectIdentifier) => {
  return await get(`${host}/api/projects/phrases/${projectIdentifier}`, headers());
}
