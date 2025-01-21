import { Provider } from "react-redux";
import { renderHook, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { useProject } from "./useProject";
import { syncProject, setProject } from "../redux/EditorSlice";
import { defaultScratchProject } from "../utils/defaultProjects";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

const loadProject = jest.fn();
const reactAppApiEndpoint = "localhost";

jest.mock("../redux/EditorSlice");

jest.mock("../utils/apiCallHandler", () => () => ({
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

  test("If no identifier uses default Scratch project", () => {
    renderHook(() => useProject({}), { wrapper });
    expect(setProject).toHaveBeenCalledWith(defaultScratchProject);
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
      () =>
        useProject({
          projectIdentifier: project1.identifier,
          accessToken,
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        locale: "ja-JP",
        accessToken,
        reactAppApiEndpoint,
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
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        locale: "ja-JP",
        accessToken,
        reactAppApiEndpoint,
      }),
    );
  });

  test("If no cached project loads uncached project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    renderHook(
      () =>
        useProject({
          projectIdentifier: "hello-world-project",
          accessToken,
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: "hello-world-project",
        locale: "ja-JP",
        accessToken,
        reactAppApiEndpoint,
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
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("loadRemix");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        accessToken,
        reactAppApiEndpoint,
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
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: project1.identifier,
        locale: "ja-JP",
        accessToken,
        reactAppApiEndpoint,
      }),
    );
  });

  test("If assetsIdentifer is set then set assetsOnly to true when loading project", async () => {
    syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
    renderHook(
      () =>
        useProject({
          assetsIdentifier: "hello-world-project",
          accessToken,
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: "hello-world-project",
        locale: "ja-JP",
        accessToken,
        assetsOnly: true,
        reactAppApiEndpoint,
      }),
    );
  });

  describe("when code property is set and loading state is 'success'", () => {
    const projectWithOnlyAssets = {
      image_list: [
        { filename: "image1.jpg", url: "http://example.com/image1.jpg" },
      ],
    };

    beforeEach(() => {
      initialState.editor.loading = "success";
      const mockStore = configureStore([]);
      store = mockStore(initialState);
      wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    });

    describe("when project_type is not set", () => {
      beforeEach(() => {
        initialState.editor.project = projectWithOnlyAssets;
      });

      test("updates project with supplied source code", () => {
        renderHook(() => useProject({ code: "# my source code" }), { wrapper });
        expect(setProject).toHaveBeenCalledWith({
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "# my source code",
            },
          ],
          ...projectWithOnlyAssets,
        });
      });
    });

    describe("when project_type is python", () => {
      beforeEach(() => {
        initialState.editor.project = {
          ...projectWithOnlyAssets,
          project_type: "python",
        };
      });

      test("updates project with supplied source code", () => {
        renderHook(() => useProject({ code: "# my source code" }), { wrapper });
        expect(setProject).toHaveBeenCalledWith({
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "# my source code",
            },
          ],
          ...projectWithOnlyAssets,
        });
      });
    });

    describe("when project_type is html", () => {
      beforeEach(() => {
        initialState.editor.project = {
          ...projectWithOnlyAssets,
          project_type: "html",
        };
      });

      test("updates project with supplied source code", () => {
        renderHook(() => useProject({ code: "<!-- my source code -->" }), {
          wrapper,
        });
        expect(setProject).toHaveBeenCalledWith({
          project_type: "html",
          components: [
            {
              name: "index",
              extension: "html",
              content: "<!-- my source code -->",
            },
          ],
          ...projectWithOnlyAssets,
        });
      });
    });

    describe("when project already has a python main component", () => {
      beforeEach(() => {
        initialState.editor.project = {
          ...projectWithOnlyAssets,
          components: [
            {
              name: "main",
              extension: "py",
              content: "# code for existing main component",
            },
          ],
        };
      });

      test("overwrites source code in existing main component", () => {
        renderHook(() => useProject({ code: "# my source code" }), { wrapper });
        expect(setProject).toHaveBeenCalledWith({
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "# my source code",
            },
          ],
          ...projectWithOnlyAssets,
        });
      });
    });

    describe("when project already has an html main component", () => {
      beforeEach(() => {
        initialState.editor.project = {
          ...projectWithOnlyAssets,
          project_type: "html",
          components: [
            {
              name: "index",
              extension: "html",
              content: "<!-- code for existing main component -->",
            },
          ],
        };
      });

      test("overwrites source code in existing main component", () => {
        renderHook(() => useProject({ code: "<!-- my source code -->" }), {
          wrapper,
        });
        expect(setProject).toHaveBeenCalledWith({
          project_type: "html",
          components: [
            {
              name: "index",
              extension: "html",
              content: "<!-- my source code -->",
            },
          ],
          ...projectWithOnlyAssets,
        });
      });
    });

    describe("when project already has other components", () => {
      beforeEach(() => {
        initialState.editor.project = {
          ...projectWithOnlyAssets,
          components: [
            {
              name: "not-main",
              extension: "py",
              content: "# some other code",
            },
          ],
        };
      });

      test("leaves existing components intact", () => {
        renderHook(() => useProject({ code: "# my source code" }), { wrapper });
        expect(setProject).toHaveBeenCalledWith({
          ...projectWithOnlyAssets,
          components: [
            {
              name: "not-main",
              extension: "py",
              content: "# some other code",
            },
            {
              name: "main",
              extension: "py",
              content: "# my source code",
            },
          ],
          project_type: "python",
        });
      });
    });
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
          reactAppApiEndpoint,
        }),
      { wrapper },
    );
    expect(syncProject).toHaveBeenCalledWith("load");
    await waitFor(() =>
      expect(loadProject).toHaveBeenCalledWith({
        identifier: "hello-world-project",
        locale: "ja-JP",
        accessToken,
        reactAppApiEndpoint,
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
  });
});
