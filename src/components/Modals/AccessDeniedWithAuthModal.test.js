import React from "react";
import Modal from "react-modal";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import AccessDeniedWithAuthModal from "./AccessDeniedWithAuthModal";
import { syncProject } from "../../redux/EditorSlice";
import { defaultPythonProject } from "../../utils/defaultProjects";

jest.mock("../../redux/EditorSlice", () => ({
  ...jest.requireActual("../../redux/EditorSlice"),
  syncProject: jest.fn((_) => jest.fn()),
}));

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const middlewares = [];
const mockStore = configureStore(middlewares);

describe("When accessDeniedWithAuthModalShowing is true", () => {
  let store;

  beforeAll(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "app");
    global.document.body.appendChild(root);
    Modal.setAppElement("#app");
  });

  beforeEach(() => {
    const initialState = {
      editor: {
        accessDeniedWithAuthModalShowing: true,
      },
      auth: {
        user: user,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <AccessDeniedWithAuthModal />
      </Provider>,
    );
  });

  test("Modal rendered", () => {
    expect(
      screen.queryByText("project.accessDeniedWithAuthModal.heading"),
    ).toBeInTheDocument();
  });

  test("Clicking new project creates a new project", async () => {
    const newProjectLink = screen.queryByText(
      "project.accessDeniedWithAuthModal.newProject",
    );
    const saveAction = { type: "SAVE_PROJECT" };
    const saveProject = jest.fn(() => saveAction);
    syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
    fireEvent.click(newProjectLink);
    await waitFor(() =>
      expect(saveProject).toHaveBeenCalledWith({
        project: defaultPythonProject,
        accessToken: user.access_token,
        autosave: false,
      }),
    );
    expect(store.getActions()[0]).toEqual(saveAction);
  });
});
