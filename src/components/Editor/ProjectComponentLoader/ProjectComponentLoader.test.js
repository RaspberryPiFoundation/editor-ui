import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectComponentLoader from "./ProjectComponentLoader";
import { setProject } from "../EditorSlice";
import { defaultPythonProject } from "../../../utils/defaultProjects";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

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
