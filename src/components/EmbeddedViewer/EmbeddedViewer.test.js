import React from "react";
import EmbeddedViewer from "./EmbeddedViewer";

import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import { useProject } from "../../hooks/useProject";

let mockBrowserPreview = false;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    identifier: "my-amazing-project",
  }),
  useSearchParams: () => [
    {
      get: (key) => (key === "browserPreview" ? mockBrowserPreview : null),
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
    isEmbedded: true,
    isBrowserPreview: false,
  });
});

test("Loads project with correct params if browser preview", () => {
  initialState = {
    ...initialState,
    editor: {
      ...initialState.editor,
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
    isEmbedded: true,
    isBrowserPreview: true,
  });
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
