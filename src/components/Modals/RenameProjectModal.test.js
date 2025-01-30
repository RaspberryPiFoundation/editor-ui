import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MockedProvider } from "@apollo/client/testing";
import "../../consoleMock"

import {
  RenameProjectModal,
  RENAME_PROJECT_MUTATION,
} from "./RenameProjectModal";
import { showRenamedMessage } from "../../utils/Notifications";

jest.mock("../../utils/Notifications");

describe("RenameProjectModal", () => {
  let store;
  let inputBox;
  let saveButton;
  let project = {
    name: "my first project",
    id: "XYZ",
  };
  let newName = "renamed project";
  let mocks;

  beforeEach(() => {
    mocks = [
      {
        request: {
          query: RENAME_PROJECT_MUTATION,
          variables: { id: project.id, name: newName },
        },
        result: jest.fn(() => ({
          data: {
            id: project.id,
            name: newName,
            updatedAt: "2023-02-257T14:48:00Z",
          },
        })),
      },
    ];

    const mockStore = configureStore([]);
    const initialState = {
      editor: {
        modals: {
          renameProject: project,
        },
        renameProjectModalShowing: true,
      },
    };
    store = mockStore(initialState);

    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <div id="app">
            <RenameProjectModal />
          </div>
        </Provider>
      </MockedProvider>,
    );

    inputBox = screen.getByRole("textbox");
    saveButton = screen.getByText("projectList.renameProjectModal.save");
  });

  test("Modal renders", () => {
    expect(
      screen.getByText("projectList.renameProjectModal.heading"),
    ).not.toBeNull();
  });

  test("Clicking cancel button closes modal and does not save", () => {
    const cancelButton = screen.queryByText(
      "projectList.renameProjectModal.cancel",
    );
    fireEvent.click(cancelButton);
    expect(store.getActions()).toEqual([
      { type: "editor/closeRenameProjectModal" },
    ]);
  });

  describe("Clicking save", () => {
    let renameProjectMutationMock;

    beforeEach(() => {
      renameProjectMutationMock = mocks[0].result;
      fireEvent.change(inputBox, { target: { value: "renamed project" } });
      fireEvent.click(saveButton);
    });

    test("Calls the mutation", async () => {
      await waitFor(() => expect(renameProjectMutationMock).toHaveBeenCalled());
    });

    test("Eventually closes the modal", async () => {
      await waitFor(() =>
        expect(store.getActions()).toEqual([
          { type: "editor/closeRenameProjectModal" },
        ]),
      );
    });

    test("Eventually pops up the toast notification", async () => {
      await waitFor(() => expect(showRenamedMessage).toHaveBeenCalled());
    });
  });

  describe("Pressing Enter", () => {
    let renameProjectMutationMock;

    beforeEach(() => {
      renameProjectMutationMock = mocks[0].result;
      fireEvent.change(inputBox, { target: { value: "renamed project" } });
      fireEvent.keyDown(inputBox, { key: "Enter" });
    });

    test("Calls the mutation", async () => {
      await waitFor(() => expect(renameProjectMutationMock).toHaveBeenCalled());
    });

    test("Eventually closes the modal", async () => {
      await waitFor(() =>
        expect(store.getActions()).toEqual([
          { type: "editor/closeRenameProjectModal" },
        ]),
      );
    });

    test("Eventually pops up the toast notification", async () => {
      await waitFor(() => expect(showRenamedMessage).toHaveBeenCalled());
    });
  });
});
