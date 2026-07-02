import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectBar from "./ProjectBar";
import useIsOnline from "../../hooks/useIsOnline";

jest.mock("axios");
jest.mock("../../hooks/useIsOnline");

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

beforeEach(() => {
  useIsOnline.mockReturnValue(true);
});

const renderProjectBar = (state) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({
    editor: {
      loading: "success",
      project: {},
      ...state.editor,
    },
    auth: {
      user: null,
      ...state.auth,
    },
  });

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
        project,
        lastSavedTime: new Date().getTime(),
      },
      auth: {
        user,
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

  test("Upload button is not shown", () => {
    expect(screen.queryByText("header.upload")).not.toBeInTheDocument();
  });

  test("Save button is not shown", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });

  test("Save status is shown", () => {
    expect(screen.queryByText(/saveStatus.saved/)).toBeInTheDocument();
  });
});

describe("When logged in and save is disabled", () => {
  beforeEach(() => {
    renderProjectBar({
      editor: {
        project,
        saveDisabled: true,
        lastSavedTime: new Date().getTime(),
      },
      auth: {
        user,
      },
    });
  });

  test("Save button is not shown", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});

describe("When logged in and no project identifier", () => {
  const projectWithoutId = { ...project, identifier: null };

  beforeEach(() => {
    renderProjectBar({
      editor: {
        project: projectWithoutId,
      },
      auth: {
        user,
      },
    });
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Upload button is not shown", () => {
    expect(screen.queryByText("header.upload")).not.toBeInTheDocument();
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
        project,
      },
    });
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("Upload button is not shown", () => {
    expect(screen.queryByText("header.upload")).not.toBeInTheDocument();
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
        user,
      },
    });
  });

  test("No project name", () => {
    expect(screen.queryByText(project.name)).not.toBeInTheDocument();
  });

  test("No download button", () => {
    expect(screen.queryByText("header.download")).not.toBeInTheDocument();
  });

  test("No upload button", () => {
    expect(screen.queryByText("header.upload")).not.toBeInTheDocument();
  });

  test("No save button", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});

describe("offline badge", () => {
  beforeEach(() => {
    useIsOnline.mockReturnValue(false);
  });

  test("shows offline badge for project owner when offline", () => {
    renderProjectBar({
      editor: { project, offlineEnabled: true, lastSavedTime: Date.now() },
      auth: { user },
    });
    expect(screen.queryByText("header.offline")).toBeInTheDocument();
  });

  test("shows offline badge for project owner on fresh load with no save history", () => {
    renderProjectBar({
      editor: { project, offlineEnabled: true },
      auth: { user },
    });
    expect(screen.queryByText("header.offline")).toBeInTheDocument();
  });

  test("does not show a second offline badge for non-owners (SaveButton handles it)", () => {
    const nonOwner = { ...user, profile: { user: "someone-else" } };
    renderProjectBar({
      editor: { project, offlineEnabled: true, lastSavedTime: Date.now() },
      auth: { user: nonOwner },
    });
    expect(screen.queryAllByText("header.offline")).toHaveLength(1);
  });

  test("does not show offline badge when offlineEnabled is false", () => {
    renderProjectBar({
      editor: { project, offlineEnabled: false },
      auth: { user },
    });
    expect(screen.queryByText("header.offline")).not.toBeInTheDocument();
  });
});

describe("When read only", () => {
  beforeEach(() => {
    renderProjectBar({
      editor: {
        project,
        readOnly: true,
        lastSavedTime: new Date().getTime(),
      },
      auth: {
        user,
      },
    });
  });

  test("Project name is not editable", () => {
    expect(screen.queryByTitle("header.renameProject")).not.toBeInTheDocument();
  });

  test("Upload button is not shown", () => {
    expect(screen.queryByText("header.upload")).not.toBeInTheDocument();
  });

  test("Save button is not shown", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });

  test("Save status is not shown", () => {
    expect(screen.queryByText(/saveStatus.saved/)).not.toBeInTheDocument();
  });
});
