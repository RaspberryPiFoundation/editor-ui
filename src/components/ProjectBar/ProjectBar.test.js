import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectBar from "./ProjectBar";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const project = {
  name: "Hello world",
  identifier: "hello-world-project",
  components: [],
  image_list: [],
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
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
          <ProjectBar />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Save button shown", () => {
    expect(screen.queryByText("header.save")).toBeInTheDocument();
  });
});

describe("When logged in and no project identifier", () => {
  let store;
  const project_without_id = { ...project, identifier: null };

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project_without_id,
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
          <ProjectBar />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Save button shown", () => {
    expect(screen.queryByText("header.save")).toBeInTheDocument();
  });
});

describe("When not logged in", () => {
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
        user: null,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectBar />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Save button shown", () => {
    expect(screen.queryByText("header.save")).toBeInTheDocument();
  });
});

describe("When no project loaded", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        loading: "idle",
      },
      auth: {
        user: user,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectBar />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("No project name", () => {
    expect(screen.queryByText(project.name)).not.toBeInTheDocument();
  });

  test("No download button", () => {
    expect(screen.queryByText("header.download")).not.toBeInTheDocument();
  });

  test("No save button", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});
