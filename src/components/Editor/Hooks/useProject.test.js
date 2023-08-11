import { renderHook } from "@testing-library/react";
import { useProject } from "./useProject";
import { syncProject, setProject } from "../EditorSlice";
import { waitFor } from "@testing-library/react";
import { defaultPythonProject } from "../../../utils/defaultProjects";

let mockBrowserPreview = "false";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: () => [
    {
      get: (key) => (key === "browserPreview" ? mockBrowserPreview : null),
    },
  ],
}));

const loadProject = jest.fn();

jest.mock("../EditorSlice");

jest.mock("../../../utils/apiCallHandler", () => ({
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

test("If no identifier uses default python project", () => {
  renderHook(() => useProject({}));
  expect(setProject).toHaveBeenCalledWith(defaultPythonProject);
});

test("If cached project matches identifer uses cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject));
  renderHook(() => useProject({ projectIdentifier: cachedProject.identifier }));
  expect(setProject).toHaveBeenCalledWith(cachedProject);
});

test("If cached project matches identifer clears cached project", () => {
  localStorage.setItem(cachedProject.identifier, JSON.stringify(cachedProject));
  renderHook(() => useProject({ projectIdentifier: cachedProject.identifier }));
  expect(localStorage.getItem("project")).toBeNull();
});

test("If cached project does not match identifer does not use cached project", async () => {
  syncProject.mockImplementationOnce(jest.fn((_) => jest.fn()));
  localStorage.setItem("project", JSON.stringify(cachedProject));
  renderHook(() => useProject({ projectIdentifier: "my-favourite-project" }));
  await waitFor(() =>
    expect(setProject).not.toHaveBeenCalledWith(cachedProject),
  );
});

test("If cached project does not match identifier loads correct uncached project", async () => {
  syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
  localStorage.setItem("project", JSON.stringify(cachedProject));
  renderHook(() =>
    useProject({ projectIdentifier: project1.identifier, accessToken }),
  );
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
  renderHook(() =>
    useProject({ projectIdentifier: "hello-world-project", accessToken }),
  );
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
  renderHook(() => useProject({ projectIdentifier: "my-favourite-project" }));
  await waitFor(() => expect(setProject).not.toHaveBeenCalled());
});

test("If embedded and cached project, loads from server", async () => {
  syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
  localStorage.setItem("hello-world-project", JSON.stringify(cachedProject));
  renderHook(() =>
    useProject({
      projectIdentifier: "hello-world-project",
      accessToken,
      isEmbedded: true,
    }),
  );
  await waitFor(() =>
    expect(loadProject).toHaveBeenCalledWith({
      identifier: "hello-world-project",
      locale: "ja-JP",
      accessToken,
    }),
  );
});

test("If new tab browser preview, uses cached changes", () => {
  mockBrowserPreview = "true";
  localStorage.setItem("hello-world-project", JSON.stringify(cachedProject));
  renderHook(() =>
    useProject({
      projectIdentifier: "hello-world-project",
      accessToken,
      isEmbedded: true,
    }),
  );
  expect(setProject).toHaveBeenCalledWith(cachedProject);
});

afterEach(() => {
  localStorage.clear();
});
