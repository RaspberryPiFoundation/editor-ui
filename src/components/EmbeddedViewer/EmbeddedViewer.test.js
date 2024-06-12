import React from "react";
import EmbeddedViewer from "./EmbeddedViewer";

import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";

import { useProject } from "../../hooks/useProject";
import { setBrowserPreview, setPage } from "../../redux/EditorSlice";

let mockBrowserPreview = false;
let testPage = "index.html";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    identifier: "my-amazing-project",
  }),
  useSearchParams: () => [
    {
      get: (key) => {
        if (key === "browserPreview") {
          return mockBrowserPreview;
        } else if (key === "page") {
          return testPage;
        }
      },
    },
  ],
}));

jest.mock("../../hooks/useProject", () => ({
  useProject: jest.fn(),
}));

let initialState;
let store;

beforeEach(() => {
  initialState = {
    editor: {
      project: {
        components: [
          {
            name: "main",
            extension: "py",
          },
        ],
        project_type: "python",
      },
      isBrowserPreview: false,
      loading: "failed",
      notFoundModalShowing: false,
      accessDeniedNoAuthModalShowing: false,
      accessDeniedWithAuthModalShowing: false,
    },
    auth: {
      user: {
        access_token: "my_token",
      },
    },
  };
});

test("Renders without crashing", () => {
  initialState = {
    ...initialState,
    editor: {
      ...initialState.editor,
      loading: "success",
    },
  };

  const mockStore = configureStore([]);
  store = mockStore(initialState);

  const { asFragment } = render(
    <Provider store={store}>
      <EmbeddedViewer />
    </Provider>,
  );
  expect(asFragment()).toMatchSnapshot();
});

test("Loads project with correct params", () => {
  initialState = {
    ...initialState,
    editor: {
      ...initialState.editor,
      isBrowserPreview: false,
      loading: "success",
    },
  };

  const mockStore = configureStore([]);
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <EmbeddedViewer />
    </Provider>,
  );
  expect(useProject).toHaveBeenCalledWith({
    projectIdentifier: "my-amazing-project",
    accessToken: "my_token",
  });
});

test("Loads project with correct params if browser preview", () => {
  initialState = {
    ...initialState,
    editor: {
      ...initialState.editor,
      isBrowserPreview: true,
      loading: "success",
    },
  };

  const mockStore = configureStore([]);
  store = mockStore(initialState);
  mockBrowserPreview = "true";

  render(
    <Provider store={store}>
      <EmbeddedViewer />
    </Provider>,
  );
  expect(useProject).toHaveBeenCalledWith({
    projectIdentifier: "my-amazing-project",
    accessToken: "my_token",
  });

  expect(store.getActions()).toEqual(
    expect.arrayContaining([setBrowserPreview(true)]),
  );
});

test("Renders the expected modal when the project can't be found", () => {
  initialState = {
    ...initialState,
    editor: {
      ...initialState.editor,
      notFoundModalShowing: true,
    },
  };

  const mockStore = configureStore([]);
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <div id="app">
        <EmbeddedViewer />
      </div>
    </Provider>,
  );

  expect(
    screen.queryByText("project.notFoundModal.projectsSiteLinkText"),
  ).toBeInTheDocument();
});

test("Renders the expected modal when the project is found but user is not authorised", () => {
  initialState = {
    ...initialState,
    editor: {
      ...initialState.editor,
      accessDeniedNoAuthModalShowing: true,
      modals: {
        accessDenied: { identifier: "huh", projectType: "oh" },
      },
    },
  };

  const mockStore = configureStore([]);
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <div id="app">
        <EmbeddedViewer />
      </div>
    </Provider>,
  );

  expect(
    screen.queryByText("project.accessDeniedNoAuthModal.projectsSiteLinkText"),
  ).toBeInTheDocument();
});

describe("When page first loaded from search params", () => {
  let store;

  beforeEach(async () => {
    mockBrowserPreview = "true";
    initialState = {
      ...initialState,
      editor: {
        ...initialState.editor,
        isBrowserPreview: false,
      },
    };

    const mockStore = configureStore([]);
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[`?browserPreview=true&page=${testPage}`]}
        >
          <div id="app">
            <EmbeddedViewer />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Dispatches action to set browser preview", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([setBrowserPreview(true)]),
    );
  });

  test("Dispatches action to set page", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([setPage(testPage)]),
    );
  });
});
