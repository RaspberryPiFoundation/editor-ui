import { Provider } from "react-redux";
import { renderHook, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { useProject } from "./useProject";
import { syncProject, setProject } from "../redux/EditorSlice";
import { defaultPythonProject } from "../utils/defaultProjects";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

const loadProject = jest.fn();

jest.mock("../redux/EditorSlice");

jest.mock("../utils/apiCallHandler", () => ({
  readProject: async (identifier, projectType) =>
    Promise.resolve({
      data: { identifier: identifier, project_type: projectType },
    }),
}));

const cachedProject = {
  project_type: "python",
  identifier: "hello-world-project",
  components: [],
};

const project1 = {
  project_type: "python",
  identifier: "my-favourite-project",
};

const accessToken = "my_access_token";

let initialState;
let store;
let wrapper;

describe("When not embedded", () => {
  beforeEach(() => {
    initialState = {
      editor: {
        isBrowserPreview: false,
        isEmbedded: false,
      },
    };
    const mockStore = configureStore([]);
    store = mockStore(initialState);
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  test("If no identifier uses default python project", () => {
    renderHook(() => useProject({}), { wrapper });
    expect(setProject).toHaveBeenCalledWith(defaultPythonProject);
  });

  test("If cached project matches identifer uses cached project", () => {
    localStorage.setItem(
      cachedProject.identifier,
      JSON.stringify(cachedProject),
    );
    renderHook(
      () => useProject({ projectIdentifier: cachedProject.identifier }),
      { wrapper },
    );
    expect(setProject).toHaveBeenCalledWith(cachedProject);
  });

  test("If cached project matches identifer clears cached project", () => {
    localStorage.setItem(
      cachedProject.identifier,
      JSON.stringify(cachedProject),
    );
    renderHook(
      () => useProject({ projectIdentifier: cachedProject.identifier }),
      { wrapper },
    );
    expect(localStorage.getItem("project")).toBeNull();
  });

  test("If cached project does not match identifer does not use cached project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => jest.fn()));
    localStorage.setItem("project", JSON.stringify(cachedProject));
    renderHook(
      () => useProject({ projectIdentifier: "my-favourite-project" }),
      {
        wrapper,
      },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(setProject).not.toHaveBeenCalledWith(cachedProject),
    );
  });

  test("If cached project does not match identifier loads correct uncached project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    localStorage.setItem("project", JSON.stringify(cachedProject));
    renderHook(
      () => useProject({ projectIdentifier: project1.identifier, accessToken }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        locale: "ja-JP",
        accessToken,
      }),
    );
  });

  test("If loadCache is set to false it loads correct uncached project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    localStorage.setItem("project", JSON.stringify(cachedProject));
    renderHook(
      () =>
        useProject({
          projectIdentifier: project1.identifier,
          accessToken,
          loadCache: false,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        locale: "ja-JP",
        accessToken,
      }),
    );
  });

  test("If no cached project loads uncached project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    renderHook(
      () =>
        useProject({ projectIdentifier: "hello-world-project", accessToken }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: "hello-world-project",
        locale: "ja-JP",
        accessToken,
      }),
    );
  });

  test("If requested locale does not match the set language, does not set project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => jest.fn()));
    renderHook(
      () => useProject({ projectIdentifier: "my-favourite-project" }),
      {
        wrapper,
      },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() => expect(setProject).not.toHaveBeenCalled());
  });

  test("If new tab browser preview, uses cached changes", () => {
    localStorage.setItem("hello-world-project", JSON.stringify(cachedProject));
    renderHook(
      () =>
        useProject({
          projectIdentifier: "hello-world-project",
          accessToken,
          isEmbedded: true,
          isBrowserPreview: true,
        }),
      { wrapper },
    );
    expect(setProject).toHaveBeenCalledWith(cachedProject);
  });

  test("If no identifier or cached project, uses code attribute", () => {
    const code = "print('hello world')";
    const expectedProject = {
      name: "Blank project",
      project_type: "python",
      components: [{ name: "main", extension: "py", content: code }],
    };
    renderHook(
      () =>
        useProject({
          code,
          accessToken,
        }),
      { wrapper },
    );
    expect(setProject).toHaveBeenCalledWith(expectedProject);
  });

  test("If loadRemix of a project is requested and remixLoadFailed is false", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    renderHook(
      () =>
        useProject({
          projectIdentifier: project1.identifier,
          accessToken,
          loadRemix: true,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("loadRemix");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        accessToken,
      }),
    );
  });

  test("If loadRemix of a project is requested and remixLoadFailed is true", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    renderHook(
      () =>
        useProject({
          projectIdentifier: project1.identifier,
          accessToken,
          loadRemix: true,
          remixLoadFailed: true,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        locale: "ja-JP",
        accessToken,
      }),
    );
  });

  test("If assetsIdentifer is set then set assetsOnly to true when loading project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    renderHook(
      () =>
        useProject({ assetsIdentifier: "hello-world-project", accessToken }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: "hello-world-project",
        locale: "ja-JP",
        accessToken,
        assetsOnly: true,
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
  });
});

describe("When embedded", () => {
  beforeEach(() => {
    initialState = {
      editor: {
        isBrowserPreview: false,
        isEmbedded: true,
      },
    };
    const mockStore = configureStore([]);
    store = mockStore(initialState);
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  test("If embedded and cached project, loads from server", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    localStorage.setItem("hello-world-project", JSON.stringify(cachedProject));
    renderHook(
      () =>
        useProject({
          projectIdentifier: "hello-world-project",
          accessToken,
          isEmbedded: true,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: "hello-world-project",
        locale: "ja-JP",
        accessToken,
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
  });
});
