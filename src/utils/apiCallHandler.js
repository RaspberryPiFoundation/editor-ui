import axios from 'axios';

const host = process.env.REACT_APP_API_ENDPOINT;

const get = async (url) => {
  return await axios.get(url, {headers: {
      'Accept': 'application/json'
    }
  });
}

const post = async (url, body) => {
  if (!body) {
    body = {}
  }
  return await axios.post(url, body, { 
    headers: {
      'Accept': 'application/json'
    }
  });
}

const put = async (url, body) => {
  return await axios.put(url, body)
}

export const updateProject = async (project) => {
  return await put(
    `${host}/api/projects/phrases/${project.identifier}`,
    { project: project }
  );
}

export const newProject = async () => {
  return await post(`${host}/api/default_project/`);
}

export const remixProject = async (projectIdentifier) => {
  return await post(`${host}/api/projects/phrases/${projectIdentifier}/remix`);
}

export const readProject = async (projectIdentifier) => {
  return await get(`${host}/api/projects/phrases/${projectIdentifier}`);
}
