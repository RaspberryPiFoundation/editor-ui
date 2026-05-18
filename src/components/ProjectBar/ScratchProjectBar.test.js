import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import ScratchProjectBar from "./ScratchProjectBar";
import editorReducer, { editorInitialState } from "../../redux/EditorSlice";
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

jest.useFakeTimers();

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
  const project = state.editor?.project || {};
  const store = configureStore({
    reducer: {
      editor: editorReducer,
      auth: (authState = {}) => authState,
    },
    preloadedState: {
      editor: {
        ...editorInitialState,
        loading: "success",
        project,
        scratchIframeProjectIdentifier: project.identifier || null,
        ...state.editor,
      },
      auth: {
        user: null,
        ...state.auth,
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <ScratchProjectBar />
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

const renderSignedInScratchProjectBar = ({
  project = scratchProject,
  editor = {},
  auth = {},
} = {}) =>
  renderScratchProjectBar({
    editor: {
      project,
      ...editor,
    },
    auth: {
      user,
      ...auth,
    },
  });

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

afterEach(() => {
  jest.clearAllTimers();
});

describe("When project is Scratch", () => {
  test("Upload button shown", () => {
    renderSignedInScratchProjectBar();

    expect(screen.queryByText("header.upload")).toBeInTheDocument();
  });

  test("Download button shown", () => {
    renderSignedInScratchProjectBar();

    expect(screen.queryByText("header.download")).toBeInTheDocument();
  });

  test("clicking Save sends scratch-gui-save for a new Scratch project", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        identifier: null,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "header.save" }));

    expect(postMessageToScratchIframe).toHaveBeenCalledTimes(1);
    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("clicking Save remixes a non-owner Scratch project on the first save", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        user_id: "teacher-id",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "header.save" }));

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-remix",
    });
  });

  test("does not show the manual Save button for an already saved Scratch project", () => {
    renderSignedInScratchProjectBar();

    expect(
      screen.queryByRole("button", { name: "header.save" }),
    ).not.toBeInTheDocument();
  });

  test("shows the autosave status for an already saved Scratch project", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        updated_at: new Date(Date.now()).toISOString(),
      },
    });

    expect(screen.getByText("saveStatus.saved now")).toBeInTheDocument();
  });

  test("auto-saves after a Scratch project change", () => {
    renderSignedInScratchProjectBar();

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });

  test("hides the manual Save button and auto-saves after a Scratch remix", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        identifier: "remixed-project",
        user_id: "teacher-id",
      },
      editor: {
        scratchIframeProjectIdentifier: scratchProject.identifier,
      },
    });

    expect(
      screen.queryByRole("button", { name: "header.save" }),
    ).not.toBeInTheDocument();

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-save",
    });
  });
});

describe("Additional Scratch manual save states", () => {
  test("shows the saving state from the scratch save hook", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        updated_at: new Date(Date.now()).toISOString(),
      },
    });

    dispatchScratchMessage("scratch-gui-saving-started");

    expect(
      screen.queryByRole("button", { name: "header.save" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/saveStatus.saving/)).toBeInTheDocument();
  });

  test("shows the saved state from the scratch save hook", () => {
    renderSignedInScratchProjectBar();

    dispatchScratchMessage("scratch-gui-saving-succeeded");

    expect(
      screen.queryByRole("button", { name: "header.save" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("saveStatus.saved now")).toBeInTheDocument();
  });

  test("does not show a saved status after a Scratch save failure", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        updated_at: new Date(Date.now()).toISOString(),
      },
    });

    dispatchScratchMessage("scratch-gui-saving-failed");

    expect(screen.queryByText(/saveStatus.saved/)).not.toBeInTheDocument();
  });

  test("shows the saving state during a Scratch remix", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        user_id: "teacher-id",
      },
    });

    dispatchScratchMessage("scratch-gui-remixing-started");

    expect(screen.getByRole("button", { name: "header.save" })).toBeDisabled();
  });

  test("does not auto-save a non-owner Scratch project before the first remix save", () => {
    renderSignedInScratchProjectBar({
      project: {
        ...scratchProject,
        updated_at: new Date(Date.now()).toISOString(),
        user_id: "teacher-id",
      },
    });

    expect(screen.queryByText(/saveStatus.saved/)).not.toBeInTheDocument();

    dispatchScratchMessage("scratch-gui-project-changed");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(postMessageToScratchIframe).not.toHaveBeenCalled();
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
