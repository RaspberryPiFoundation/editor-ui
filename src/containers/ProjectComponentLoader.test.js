import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectComponentLoader from "./ProjectComponentLoader";
import { defaultPythonProject } from "../utils/defaultProjects";
import { matchMedia, setMedia } from "mock-match-media";
import { MOBILE_BREAKPOINT } from "../utils/mediaQueryBreakpoints";

import { setProject } from "../redux/EditorSlice";
import { useProjectPersistence } from "../hooks/useProjectPersistence";

jest.mock("../hooks/useProjectPersistence", () => ({
  useProjectPersistence: jest.fn(),
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
