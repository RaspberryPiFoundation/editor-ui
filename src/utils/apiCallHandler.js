import axios from "axios";
import omit from "lodash/omit";

export class Api {
  api;

  constructor() {
    this.api = axios.create({ baseURL: process.env.REACT_APP_API_ENDPOINT });
  };

  async createOrUpdateProject (projectWithUserId, accessToken) {
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

  async deleteProject(identifier, accessToken) {
    return await axios.delete(
      `${host}/api/projects/${identifier}`,
      headers(accessToken),
    );
  };

  async getImage(url) {
    return await get(url, headers());
  };

  async loadRemix(projectIdentifier, accessToken) {
    return await get(
      `${host}/api/projects/${projectIdentifier}/remix`,
      headers(accessToken),
    );
  };

  async createRemix(project, accessToken) {
    return await post(
      `${host}/api/projects/${project.identifier}/remix`,
      { project },
      headers(accessToken),
    );
  };

  async readProject(projectIdentifier, locale, accessToken) {
    const queryString = locale ? `?locale=${locale}` : "";
    return await get(
      `${host}/api/projects/${projectIdentifier}${queryString}`,
      headers(accessToken),
    );
  };

  async loadAssets(assetsIdentifier, locale, accessToken) {
    const queryString = locale ? `?locale=${locale}` : "";
    return await get(
      `${host}/api/projects/${assetsIdentifier}/images${queryString}`,
      headers(accessToken),
    );
  };

  async readProjectList(page, accessToken) {
    return await get(`${host}/api/projects`, {
      params: { page },
      ...headers(accessToken),
    });
  };

  async uploadImages(projectIdentifier, accessToken, images) {
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

  async createError(
    projectIdentifier,
    userId,
    error,
    sendError = false,
  ) {
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

  async #get(url, headers) {
    return await axios.get(url, headers);
  };

  async #post(url, body, headers) {
    return await axios.post(url, body, headers);
  };

  async #put(url, body, headers) {
    return await axios.put(url, body, headers);
  };

  #headers(accessToken) {
    let headersHash;
    if (accessToken) {
      headersHash = { Accept: "application/json", Authorization: accessToken };
    } else {
      headersHash = { Accept: "application/json" };
    }
    return { headers: headersHash };
  };
}
