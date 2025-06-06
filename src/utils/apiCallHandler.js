import axios from "axios";
import omit from "lodash/omit";

const ApiCallHandler = ({ reactAppApiEndpoint }) => {
  const host = reactAppApiEndpoint;

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

  const createOrUpdateProject = async (projectWithUserId, accessToken) => {
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

  const deleteProject = async (identifier, accessToken) => {
    return await axios.delete(
      `${host}/api/projects/${identifier}`,
      headers(accessToken),
    );
  };

  const getImage = async (url) => {
    return await get(url, headers());
  };

  const loadRemix = async (projectIdentifier, accessToken) => {
    return await get(
      `${host}/api/projects/${projectIdentifier}/remix`,
      headers(accessToken),
    );
  };

  const createRemix = async (project, accessToken) => {
    return await post(
      `${host}/api/projects/${project.identifier}/remix`,
      { project },
      headers(accessToken),
    );
  };

  const readProject = async (projectIdentifier, locale, accessToken) => {
    const queryString = locale ? `?locale=${locale}` : "";
    return await get(
      `${host}/api/projects/${projectIdentifier}${queryString}`,
      headers(accessToken),
    );
  };

  const loadAssets = async (assetsIdentifier, locale, accessToken) => {
    const queryString = locale ? `?locale=${locale}` : "";
    return await get(
      `${host}/api/projects/${assetsIdentifier}/images${queryString}`,
      headers(accessToken),
    );
  };

  const readProjectList = async (page, accessToken) => {
    return await get(`${host}/api/projects`, {
      params: { page },
      ...headers(accessToken),
    });
  };

  const uploadImages = async (projectIdentifier, accessToken, images) => {
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

  const createError = async (
    projectIdentifier,
    userId,
    error,
    sendError = false,
  ) => {
    if (!sendError) {
      return;
    }
    const { errorMessage, errorType } = error;
    return await post(`${host}/api/project_errors`, {
      error: errorMessage,
      error_type: errorType,
      project_id: projectIdentifier,
      user_id: userId,
    });
  };

  return {
    get,
    post,
    put,
    createOrUpdateProject,
    deleteProject,
    getImage,
    loadRemix,
    createRemix,
    readProject,
    loadAssets,
    readProjectList,
    uploadImages,
    createError,
  };
};

export default ApiCallHandler;
