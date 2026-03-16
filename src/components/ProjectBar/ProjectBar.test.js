import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectBar from "./ProjectBar";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

jest.mock("axios");
jest.mock("../../utils/scratchIframe", () => ({
  postMessageToScratchIframe: jest.fn(),
}));

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

const scratchProject = {
  ...project,
  project_type: "code_editor_scratch",
};

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

const getScratchOrigin = () => process.env.ASSETS_URL || window.location.origin;

const dispatchScratchMessage = (type, origin = getScratchOrigin()) => {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin,
        data: { type },
      }),
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

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

describe("When project is Scratch", () => {
  beforeEach(() => {
    postMessageToScratchIframe.mockClear();
    renderProjectBar({
      editor: {
        project: scratchProject,
      },
      auth: {
        user,
      },
    });
  });

  test("Upload button shown", () => {
    expect(screen.queryByText("header.upload")).toBeInTheDocument();
  });

  test("Download button shown", () => {
    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("clicking Save sends scratch-gui-save message", () => {
    fireEvent.click(screen.getByRole("button", { name: "header.save" }));

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(1);
    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });
});

describe("Additional Scratch manual save states", () => {
  test("shows the saving state from the scratch save hook", () => {
    renderProjectBar({
      editor: {
        project: scratchProject,
      },
      auth: {
        user,
      },
    });

    dispatchScratchMessage("scratch-gui-saving-started");

    expect(
      screen.getByRole("button", { name: "saveStatus.saving" }),
    ).toBeDisabled();
  });

  test("shows the saved state from the scratch save hook", () => {
    renderProjectBar({
      editor: {
        project: scratchProject,
      },
      auth: {
        user,
      },
    });

    dispatchScratchMessage("scratch-gui-saving-succeeded");

    expect(
      screen.getByRole("button", { name: "saveStatus.saved" }),
    ).toBeInTheDocument();
  });

  test("does not show save for logged-out Scratch users", () => {
    renderProjectBar({
      editor: {
        project: scratchProject,
      },
    });

    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
    expect(screen.queryByText("header.loginToSave")).not.toBeInTheDocument();
  });

  test("shows save for logged-in non-owners", () => {
    renderProjectBar({
      editor: {
        project: {
          ...scratchProject,
          user_id: "teacher-id",
        },
      },
      auth: {
        user,
      },
    });

    expect(
      screen.getByRole("button", { name: "header.save" }),
    ).toBeInTheDocument();
  });

  test("shows save for logged-in users without a Scratch project identifier", () => {
    renderProjectBar({
      editor: {
        project: {
          ...scratchProject,
          identifier: null,
        },
      },
      auth: {
        user,
      },
    });

    expect(
      screen.getByRole("button", { name: "header.save" }),
    ).toBeInTheDocument();
  });
});
