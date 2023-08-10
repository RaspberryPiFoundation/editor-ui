import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectStatus from "./ProjectStatus";

const project = {
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "a19dc471-c857-450b-a974-6098acb1cef1",
};

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};
describe("When logged in and user owns project", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        loading: "success",
      },
      auth: {
        user: user,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectStatus />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Save status is shown", () => {
    expect(screen.queryByText("saveButton.saved")).toBeInTheDocument();
  });
});

describe("When logged out", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        loading: "idle",
      },
      auth: {
        user: {},
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectStatus />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("No saved info", () => {
    expect(screen.queryByText("saveButton.saved")).not.toBeInTheDocument();
  });
});
