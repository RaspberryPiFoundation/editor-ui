import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectComponentLoader from "./ProjectComponentLoader";
import { defaultPythonProject } from "../utils/defaultProjects";
import { matchMedia, setMedia } from "mock-match-media";
import { MOBILE_BREAKPOINT } from "../utils/mediaQueryBreakpoints";

import { setProject } from "../redux/EditorSlice";
import { useProjectPersistence } from "../hooks/useProjectPersistence";
import { login } from "../utils/login";

const mockNavigate = jest.fn();

jest.mock("../utils/login");

jest.mock("../hooks/useProjectPersistence", () => ({
  useProjectPersistence: jest.fn(),
}));

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useLocation: () => "my-location",
  useNavigate: () => mockNavigate,
}));

jest.mock("react-responsive", () => ({
  ...jest.requireActual("react-responsive"),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

let mockMediaQuery = (query) => {
  return matchMedia(query).matches;
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const user = {
  access_token: "myAccessToken",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

describe("ProjectComponentLoader", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      editor: {
        project: "my-project",
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectComponentLoader match={{ params: {} }} />
        </MemoryRouter>
      </Provider>,
    );
  });

  it("handles editor-logIn custom event by calling login", () => {
    act(() => {
      document.dispatchEvent(new CustomEvent("editor-logIn"));
    });

    it("Renders editor", () => {
      expect(screen.queryByTestId("editor-wc")).toBeInTheDocument();
    });

    it("calls login() when editor-logIn event is received", () => {
      act(() => {
        document.dispatchEvent(new CustomEvent("editor-logIn"));
      });

      expect(login).toHaveBeenCalledWith({
        location: "my-location",
        project: "my-project",
      });
    });

    it("redirects to new project identifier on editor-projectIdentifierChanged custom event", () => {
      act(() => {
        document.dispatchEvent(
          new CustomEvent("editor-projectIdentifierChanged", {
            detail: "new-project-identifier",
          }),
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        "/ja-JP/projects/new-project-identifier",
      );
    });
  });

  describe("when user is logged in", () => {
    beforeEach(() => {
      const store = setupStore({
        editor: {
          project: "my-project",
        },
        auth: {
          user: {},
        },
      });
      renderComponent(store);
    });

    it("does not call login() when editor-logIn event is received", () => {
      act(() => {
        document.dispatchEvent(new CustomEvent("editor-logIn"));
      });

      expect(login).not.toHaveBeenCalled();
    });
  });

  test("Renders loading message if loading is pending", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        loading: "pending",
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectComponentLoader match={{ params: {} }} />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText("project.loading")).toBeInTheDocument();
  });

  test("Loads default project if loading fails", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        loading: "failed",
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectComponentLoader match={{ params: {} }} />
        </MemoryRouter>
      </Provider>,
    );
    const expectedActions = [setProject(defaultPythonProject)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Does not render loading message if loading is success", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [],
        },
        openFiles: [[]],
        focussedFileIndices: [0],
        loading: "success",
      },
      auth: {},
      instructions: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app"></div>
          <ProjectComponentLoader match={{ params: {} }} />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText("project.loading")).not.toBeInTheDocument();
  });

  test("Calls useProjectPersistence with user when logged in", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        hasShownSavePrompt: true,
        justLoaded: false,
        saveTriggered: false,
      },
      auth: { user },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app"></div>
          <ProjectComponentLoader match={{ params: {} }} />
        </MemoryRouter>
      </Provider>,
    );
    expect(useProjectPersistence).toHaveBeenCalledWith({
      user,
      project: {},
      hasShownSavePrompt: true,
      justLoaded: false,
      saveTriggered: false,
    });
  });

  test("Calls useProjectPersistence without user when logged in", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        hasShownSavePrompt: true,
        justLoaded: false,
        saveTriggered: false,
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app"></div>
          <ProjectComponentLoader match={{ params: {} }} />
        </MemoryRouter>
      </Provider>,
    );
    expect(useProjectPersistence).toHaveBeenCalledWith({
      project: {},
      hasShownSavePrompt: true,
      justLoaded: false,
      saveTriggered: false,
    });
  });
});

describe("When on mobile", () => {
  let mockStore;

  beforeEach(() => {
    setMedia({
      width: MOBILE_BREAKPOINT,
    });
    const middlewares = [];
    mockStore = configureStore(middlewares);
  });

  test("Has code and output tabs for python project", () => {
    const initialState = {
      editor: {
        project: {
          project_type: "python",
          components: [],
        },
        openFiles: [[]],
        focussedFileIndices: [0],
        loading: "success",
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <ProjectComponentLoader match={{ params: {} }} />
          </div>
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText("mobile.code")).toBeInTheDocument();
    expect(screen.queryByText("mobile.output")).toBeInTheDocument();
  });

  test("Has code and preview tabs for html project", () => {
    const initialState = {
      editor: {
        project: {
          project_type: "html",
          components: [{ name: "index", extension: "html" }],
        },
        openFiles: [["index.html"]],
        focussedFileIndices: [0],
        loading: "success",
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div id="app">
            <ProjectComponentLoader match={{ params: {} }} />
          </div>
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText("mobile.code")).toBeInTheDocument();
    expect(screen.queryByText("mobile.preview")).toBeInTheDocument();
  });
});
