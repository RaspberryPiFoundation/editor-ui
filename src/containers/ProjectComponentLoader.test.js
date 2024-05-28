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

const setupStore = (initialState) => {
  const mockStore = configureStore([]);
  return mockStore(initialState);
};

const renderComponent = (store) => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectComponentLoader match={{ params: {} }} />
      </MemoryRouter>
    </Provider>,
  );
};

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
  describe("when user is not logged in", () => {
    beforeEach(() => {
      const store = setupStore({
        editor: {
          project: {
            components: [],
          },
          openFiles: [[]],
          focussedFileIndices: [0],
          loading: "success",
        },
        auth: {
          user: null,
        },
      });
      renderComponent(store);
    });

    it("Renders editor", () => {
      act(() => {
        screen.debug();
        expect(screen.queryByTestId("editor-proj")).toBeInTheDocument();
      });
    });

    it("calls login() when editor-logIn event is received", () => {
      act(() => {
        document.dispatchEvent(new CustomEvent("editor-logIn"));
      });

      expect(login).toHaveBeenCalledWith({
        location: "my-location",
        project: {
          components: [],
        },
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
    const store = setupStore({
      editor: {
        loading: "pending",
      },
      auth: {
        user: {},
      },
    });
    renderComponent(store);
    expect(screen.queryByText("project.loading")).toBeInTheDocument();
  });

  test("Loads default project if loading fails", () => {
    const store = setupStore({
      editor: {
        loading: "failed",
      },
      auth: {
        user: {},
      },
    });
    renderComponent(store);
    const expectedActions = [setProject(defaultPythonProject)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Does not render loading message if loading is success", () => {
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
    const store = setupStore(initialState);
    renderComponent(store);
    expect(screen.queryByText("project.loading")).not.toBeInTheDocument();
  });

  test("Calls useProjectPersistence with user when logged in", () => {
    const initialState = {
      editor: {
        project: {},
        hasShownSavePrompt: true,
        justLoaded: false,
        saveTriggered: false,
      },
      auth: { user },
    };
    const store = setupStore(initialState);
    renderComponent(store);
    expect(useProjectPersistence).toHaveBeenCalledWith({
      user,
      project: {},
      hasShownSavePrompt: true,
      justLoaded: false,
      saveTriggered: false,
    });
  });

  test("Calls useProjectPersistence without user when logged in", () => {
    const initialState = {
      editor: {
        project: {},
        hasShownSavePrompt: true,
        justLoaded: false,
        saveTriggered: false,
      },
      auth: {},
    };
    const store = setupStore(initialState);
    renderComponent(store);
    expect(useProjectPersistence).toHaveBeenCalledWith({
      project: {},
      hasShownSavePrompt: true,
      justLoaded: false,
      saveTriggered: false,
    });
  });
});

describe("When on mobile", () => {

  beforeEach(() => {
    setMedia({
      width: MOBILE_BREAKPOINT,
    });
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
    const store = setupStore(initialState);
    renderComponent(store);
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
    const store = setupStore(initialState);
    renderComponent(store);
    expect(screen.queryByText("mobile.code")).toBeInTheDocument();
    expect(screen.queryByText("mobile.preview")).toBeInTheDocument();
  });
});
