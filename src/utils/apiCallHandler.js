import axios from "axios";
import omit from "lodash/omit";

// Kept in memory, not localStorage (shared across tabs), and only used if
// the access token still matches, same approach as editor-standalone's
// apiCallHandler/shared.js.
let currentAccessToken = null;
let currentUserId = null;

export const setCurrentUser = (accessToken, userId) => {
  currentAccessToken = accessToken || null;
  currentUserId = accessToken ? userId : null;
};

const getStableUserId = (accessToken) =>
  accessToken && accessToken === currentAccessToken ? currentUserId : null;

const ApiCallHandler = ({ reactAppApiEndpoint }) => {
  const host = reactAppApiEndpoint;

  const get = async (url, config) => {
    return await axios.get(url, config);
  };

  const post = async (url, body, config) => {
    return await axios.post(url, body, config);
  };

  const put = async (url, body, config) => {
    return await axios.put(url, body, config);
  };

  const headers = (accessToken) => {
    if (accessToken) {
      const headersHash = {
        Accept: "application/json",
        Authorization: accessToken,
      };
      // Read by the service worker to scope its offline cache per user — Authorization
      // rotates on token renewal so it can't be used for that without fragmenting the cache
      const userId = getStableUserId(accessToken);
      if (userId) {
        headersHash["X-Editor-User-Id"] = userId;
      }
      return headersHash;
    } else {
      return { Accept: "application/json" };
    }
  };

  const createOrUpdateProject = async (projectWithUserId, accessToken) => {
    const project = omit(projectWithUserId, ["user_id"]);
    if (!project.identifier) {
      return await post(
        `${host}/api/projects`,
        { project },
        { headers: headers(accessToken) },
      );
    } else {
      return await put(
        `${host}/api/projects/${project.identifier}`,
        { project },
        { headers: headers(accessToken) },
      );
    }
  };

  const deleteProject = async (identifier, accessToken) => {
    return await axios.delete(`${host}/api/projects/${identifier}`, {
      headers: headers(accessToken),
    });
  };

  const loadRemix = async (projectIdentifier, accessToken) => {
    return await get(`${host}/api/projects/${projectIdentifier}/remix`, {
      headers: headers(accessToken),
    });
  };

  const createRemix = async (project, accessToken) => {
    return await post(
      `${host}/api/projects/${project.identifier}/remix`,
      { project },
      { headers: headers(accessToken) },
    );
  };

  const readProject = async (projectIdentifier, locale, accessToken) => {
    const queryString = locale ? `?locale=${locale}` : "";
    return await get(
      `${host}/api/projects/${projectIdentifier}${queryString}`,
      { headers: headers(accessToken), withCredentials: true },
    );
  };

  const loadAssets = async (assetsIdentifier, locale, accessToken) => {
    const queryString = locale ? `?locale=${locale}` : "";
    return await get(
      `${host}/api/projects/${assetsIdentifier}/images${queryString}`,
      { headers: headers(accessToken) },
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
    loadRemix,
    createRemix,
    readProject,
    loadAssets,
    createError,
  };
};

export default ApiCallHandler;
