import axios from "axios";

import ApiCallHandler from "./apiCallHandler";

const {
  getImage,
  createOrUpdateProject,
  readProject,
  loadAssets,
  createRemix,
  uploadImages,
  readProjectList,
  createError,
} = ApiCallHandler({ reactAppApiEndpoint: "TODORAAE" });

jest.mock("axios");
const host = process.env.REACT_APP_API_ENDPOINT;
const defaultHeaders = { headers: { Accept: "application/json" } };
const accessToken = "39a09671-be55-4847-baf5-8919a0c24a25";
const authHeaders = {
  headers: { Accept: "application/json", Authorization: accessToken },
};

describe("Testing project API calls", () => {
  test("Creating project", async () => {
    const newProject = {
      project_type: "python",
      components: [],
      name: "Untitled",
    };
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        status: 204,
        data: {
          project: {
            identifier: "new-project-identifier",
            ...newProject,
          },
        },
      }),
    );

    const data = await createOrUpdateProject(newProject);
    expect(axios.post).toHaveBeenCalledWith(
      `${host}/api/projects`,
      { project: newProject },
      defaultHeaders,
    );
    expect(data).toStrictEqual({
      status: 204,
      data: {
        project: {
          identifier: "new-project-identifier",
          project_type: "python",
          components: [],
          name: "Untitled",
        },
      },
    });
  });

  test("Remixing project", async () => {
    const originalProject = {
      identifier: "original-hello-project",
      project_type: "python",
    };
    axios.post.mockImplementationOnce(() => {
      const remixedProject = {
        identifier: "remixed-hello-project",
        project_type: "python",
      };
      Promise.resolve({ data: remixedProject });
    });

    await createRemix(originalProject, accessToken);
    expect(axios.post).toHaveBeenCalledWith(
      `${host}/api/projects/${originalProject["identifier"]}/remix`,
      {
        project: {
          identifier: "original-hello-project",
          project_type: "python",
        },
      },
      authHeaders,
    );
  });

  test("Updating project", async () => {
    const project = {
      identifier: "my-wonderful-project",
      project_type: "python",
      components: [],
    };
    axios.put.mockImplementationOnce(() => Promise.resolve(200));

    await createOrUpdateProject(project);
    expect(axios.put).toHaveBeenCalledWith(
      `${host}/api/projects/${project["identifier"]}`,
      { project: project },
      defaultHeaders,
    );
  });

  test("Read project with identifier only", async () => {
    const projectIdentifier = "hello-world-project";
    axios.get.mockImplementationOnce(() => Promise.resolve());

    await readProject(projectIdentifier);
    expect(axios.get).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}`,
      defaultHeaders,
    );
  });

  test("Read project with locale", async () => {
    const projectIdentifier = "hello-world-project";
    const locale = "es-LA";
    axios.get.mockImplementationOnce(() => Promise.resolve());

    await readProject(projectIdentifier, locale);
    expect(axios.get).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}?locale=${locale}`,
      defaultHeaders,
    );
  });

  test("Read project with access token", async () => {
    const projectIdentifier = "hello-world-project";
    axios.get.mockImplementationOnce(() => Promise.resolve());

    await readProject(projectIdentifier, null, accessToken);
    expect(axios.get).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}`,
      authHeaders,
    );
  });

  test("Load assets with identifier only", async () => {
    const projectIdentifier = "hello-world-project";
    axios.get.mockImplementationOnce(() => Promise.resolve());

    await loadAssets(projectIdentifier);
    expect(axios.get).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}/images`,
      defaultHeaders,
    );
  });

  test("Load assets with locale", async () => {
    const projectIdentifier = "hello-world-project";
    const locale = "es-LA";
    axios.get.mockImplementationOnce(() => Promise.resolve());

    await loadAssets(projectIdentifier, locale);
    expect(axios.get).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}/images?locale=${locale}`,
      defaultHeaders,
    );
  });

  test("Load assets with access token", async () => {
    const projectIdentifier = "hello-world-project";
    axios.get.mockImplementationOnce(() => Promise.resolve());

    await loadAssets(projectIdentifier, null, accessToken);
    expect(axios.get).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}/images`,
      authHeaders,
    );
  });

  test("Upload image", async () => {
    const projectIdentifier = "my-amazing-project";
    const image = new File(["(⌐□_□)"], "image1.png", { type: "image/png" });
    axios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200, url: "google.drive.com/image1.png" }),
    );

    var formData = new FormData();
    formData.append("images[]", image, image.name);

    await uploadImages(projectIdentifier, accessToken, [image]);
    expect(axios.post).toHaveBeenCalledWith(
      `${host}/api/projects/${projectIdentifier}/images`,
      formData,
      { ...authHeaders, "Content-Type": "multipart/form-data" },
    );
  });

  test("Get image", async () => {
    const image = new File(["(⌐□_□)"], "image1.png", { type: "image/png" });
    const imageUrl = "google.drive.com/image1.png";

    axios.get.mockImplementationOnce(() => Promise.resolve({ image: image }));

    await getImage(imageUrl);
    expect(axios.get).toHaveBeenCalledWith(imageUrl, defaultHeaders);
  });
});

describe("Index page API calls", () => {
  test("Loading project list", async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(200));
    const page = 3;
    await readProjectList(page, accessToken);
    expect(axios.get).toHaveBeenCalledWith(`${host}/api/projects`, {
      ...authHeaders,
      params: { page },
    });
  });
});

describe("Testing project errors API calls", () => {
  let projectIdentifier = "original-hello-project";
  let userId = "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf";
  let error = { errorMessage: "Something went wrong" };

  axios.post.mockImplementationOnce(() => {
    Promise.resolve({ data: [], status: 201 });
  });

  test("Create a basic project error", async () => {
    projectIdentifier = undefined;
    userId = undefined;
    await createError(projectIdentifier, userId, error, true);
    expect(axios.post).toHaveBeenCalledWith(
      `${host}/api/project_errors`,
      {
        error: error.errorMessage,
      },
      undefined,
    );
  });

  test("Create project error with optional parameters", async () => {
    error = {
      errorMessage: "Something went wrong",
      errorType: "SomeDummyError",
    };
    await createError(projectIdentifier, userId, error, true);
    expect(axios.post).toHaveBeenCalledWith(
      `${host}/api/project_errors`,
      {
        project_id: projectIdentifier,
        user_id: userId,
        error: error.errorMessage,
        error_type: error?.errorType,
      },
      undefined,
    );
  });

  test("Create project error not called", async () => {
    error = {
      errorMessage: "Something went wrong",
      errorType: "SomeDummyError",
    };
    await createError(projectIdentifier, userId, error);
    expect(axios.post).not.toHaveBeenCalledWith(
      `${host}/api/project_errors`,
      {
        project_id: projectIdentifier,
        user_id: userId,
        error: error.errorMessage,
        error_type: error?.errorType,
      },
      undefined,
    );
  });
});
