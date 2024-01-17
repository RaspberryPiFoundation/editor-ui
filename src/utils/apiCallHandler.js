import axios from "axios";
import omit from "lodash/omit";
import { defaultPythonProject } from "./defaultProjects";

const host = process.env.REACT_APP_API_ENDPOINT;

const get = async (url, headers) => {
  return await axios.get(url, headers);
};

const post = async (url, body, headers) => {
  return await axios.post(url, body, headers);
};

const put = async (url, body, headers) => {
  return await axios.put(url, body, headers);
};

const headers = (accessToken) => {
  let headersHash;
  if (accessToken) {
    headersHash = { Accept: "application/json", Authorization: accessToken };
  } else {
    headersHash = { Accept: "application/json" };
  }
  return { headers: headersHash };
};

export const createOrUpdateProject = async (projectWithUserId, accessToken) => {
  const project = omit(projectWithUserId, ["user_id"]);
  if (!project.identifier) {
    return await post(
      `${host}/api/projects`,
      { project },
      headers(accessToken),
    );
  } else {
    return await put(
      `${host}/api/projects/${project.identifier}`,
      { project },
      headers(accessToken),
    );
  }
};

export const deleteProject = async (identifier, accessToken) => {
  return await axios.delete(
    `${host}/api/projects/${identifier}`,
    headers(accessToken),
  );
};

export const getImage = async (url) => {
  return await get(url, headers());
};

export const loadRemix = async (projectIdentifier, accessToken) => {
  return await get(
    `${host}/api/projects/${projectIdentifier}/remix`,
    headers(accessToken),
  );
};

export const createRemix = async (project, accessToken) => {
  return await post(
    `${host}/api/projects/${project.identifier}/remix`,
    { project },
    headers(accessToken),
  );
};

export const readProject = async (
  projectIdentifier,
  codeIdentifier,
  assetIdentifier,
  locale,
  accessToken,
) => {
  const queryString = locale ? `?locale=${locale}` : "";

  //todo, check if code and asset are same, check if normal identifier, load, merge, return

  if (projectIdentifier) {
    return await get(
      `${host}/api/projects/${projectIdentifier}${queryString}`,
      headers(accessToken),
    );
  } else {
    //Load separate code and assets

    const loadCode = new Promise(async (resolve, reject) => {
      if (!codeIdentifier) return resolve(defaultPythonProject);

      const code = await get(
        `${host}/api/projects/${codeIdentifier}${queryString}`,
        headers(accessToken),
      );

      resolve({
        components: code.data.components,
        identifier: code.data.identifier,
        locale: code.data.locale,
        name: code.data.name,
        project_type: code.data.project_type,
        user_id: code.data.user_id,
      });
    });

    const loadAssets = new Promise(async (resolve, reject) => {
      if (!assetIdentifier) return resolve({ image_list: [] });

      const assets = await get(
        `${host}/api/projects/${assetIdentifier}/images`,
        headers(accessToken),
      );

      resolve({
        image_list: assets.data.image_list,
      });
    });

    const result = await Promise.all([loadCode, loadAssets]).then((res) => {
      return res.reduce(function (acc, row) {
        return { ...acc, ...row };
      }, {});
    });

    return {
      data: result,
    };
  }
};

export const readProjectList = async (page, accessToken) => {
  return await get(`${host}/api/projects`, {
    params: { page },
    ...headers(accessToken),
  });
};

export const uploadImages = async (projectIdentifier, accessToken, images) => {
  var formData = new FormData();

  images.forEach((image) => {
    formData.append("images[]", image, image.name);
  });

  return await post(
    `${host}/api/projects/${projectIdentifier}/images`,
    formData,
    { ...headers(accessToken), "Content-Type": "multipart/form-data" },
  );
};

export const createError = async (projectIdentifier, userId, error) => {
  const { errorMessage, errorType } = error;
  return await post(`${host}/api/project_errors`, {
    error: errorMessage,
    error_type: errorType,
    project_id: projectIdentifier,
    user_id: userId,
  });
};
