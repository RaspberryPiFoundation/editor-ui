import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ScratchProjectBar from "./ScratchProjectBar";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

jest.mock("axios");
jest.mock("../../utils/scratchIframe", () => ({
  ...jest.requireActual("../../utils/scratchIframe"),
  postMessageToScratchIframe: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const scratchProject = {
  name: "Hello world",
  identifier: "hello-world-project",
  components: [],
  image_list: [],
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  project_type: "code_editor_scratch",
};

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const renderScratchProjectBar = (state) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const project = state.editor?.project || {};
  const store = mockStore({
    editor: {
      loading: "success",
      project,
      scratchIframeProjectIdentifier: project.identifier || null,
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
        <ScratchProjectBar />
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

describe("When project is Scratch", () => {
  beforeEach(() => {
    postMessageToScratchIframe.mockClear();
    renderScratchProjectBar({
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

  test("clicking Save remixes a non-owner Scratch project on the first save", () => {
    renderScratchProjectBar({
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

    fireEvent.click(screen.getAllByRole("button", { name: "header.save" })[1]);

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-remix",
    });
  });
});

describe("Additional Scratch manual save states", () => {
  test("shows the saving state from the scratch save hook", () => {
    renderScratchProjectBar({
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
    renderScratchProjectBar({
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

  test("shows the saving state during a Scratch remix", () => {
    renderScratchProjectBar({
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

    dispatchScratchMessage("scratch-gui-remixing-started");

    expect(
      screen.getByRole("button", { name: "saveStatus.saving" }),
    ).toBeDisabled();
  });

  test("does not show save for logged-out Scratch users", () => {
    renderScratchProjectBar({
      editor: {
        project: scratchProject,
      },
    });

    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
    expect(screen.queryByText("header.loginToSave")).not.toBeInTheDocument();
  });
});
