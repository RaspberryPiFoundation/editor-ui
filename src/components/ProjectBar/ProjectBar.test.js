import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectBar from "./ProjectBar";

import "../../consoleMock";

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

const renderProjectBar = (state) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({ ...state });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectBar />
      </MemoryRouter>
    </Provider>,
  );
};

describe("When logged in and user owns project", () => {
  beforeEach(() => {
    renderProjectBar({
      editor: {
        project: project,
        loading: "success",
        lastSavedTime: new Date().getTime(),
      },
      auth: {
        user: user,
      },
    });
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Project name is editable", () => {
    expect(screen.queryByTitle("header.renameProject")).toBeInTheDocument();
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Save button is not shown", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });

  test("Save status is shown", () => {
    expect(screen.queryByText(/saveStatus.saved/)).toBeInTheDocument();
  });
});

describe("When logged in and no project identifier", () => {
  const project_without_id = { ...project, identifier: null };

  beforeEach(() => {
    renderProjectBar({
      editor: {
        project: project_without_id,
        loading: "success",
      },
      auth: {
        user: user,
      },
    });
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Project name is editable", () => {
    expect(screen.queryByTitle("header.renameProject")).toBeInTheDocument();
  });

  test("Save button is not shown", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});

describe("When not logged in", () => {
  beforeEach(() => {
    renderProjectBar({
      editor: {
        project: project,
        loading: "success",
      },
      auth: {
        user: null,
      },
    });
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });

  test("Project name is editable", () => {
    expect(screen.queryByTitle("header.renameProject")).toBeInTheDocument();
  });

  test("Login to save button shown", () => {
    expect(screen.queryByText("header.loginToSave")).toBeInTheDocument();
  });
});

describe("When no project loaded", () => {
  beforeEach(() => {
    renderProjectBar({
      editor: {
        project: {},
        loading: "idle",
      },
      auth: {
        user: user,
      },
    });
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

describe("When read only", () => {
  beforeEach(() => {
    renderProjectBar({
      editor: {
        project: project,
        loading: "success",
        readOnly: true,
        lastSavedTime: new Date().getTime(),
      },
      auth: {
        user: user,
      },
    });
  });

  test("Project name is not editable", () => {
    expect(screen.queryByTitle("header.renameProject")).not.toBeInTheDocument();
  });

  test("Save button is not shown", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });

  test("Save status is not shown", () => {
    expect(screen.queryByText(/saveStatus.saved/)).not.toBeInTheDocument();
  });
});
