import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import RenameFileModal from "./RenameFileModal";
import {
  setNameError,
  updateComponentName,
  closeRenameFileModal,
} from "../../redux/EditorSlice";

describe("Testing the rename file modal", () => {
  let store;
  let inputBox;
  let saveButton;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
            },
            {
              name: "my_file",
              extension: "py",
            },
          ],
          project_type: "python",
        },
        nameError: "",
        modals: {
          renameFile: {
            name: "main",
            ext: "py",
            fileKey: 0,
          },
        },
        renameFileModalShowing: true,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <RenameFileModal />
        </div>
      </Provider>,
    );
    inputBox = screen.getByRole("textbox");
    saveButton = screen
      .getByText("filePanel.renameFileModal.save")
      .closest("button");
  });

  test("State being set displays the modal", () => {
    expect(
      screen.getByText("filePanel.renameFileModal.heading"),
    ).toBeInTheDocument();
  });

  test("Pressing save renames the file to the given name", () => {
    fireEvent.change(inputBox, { target: { value: "file1.py" } });
    fireEvent.click(saveButton);
    const expectedActions = [
      updateComponentName({ key: 0, extension: "py", name: "file1" }),
      closeRenameFileModal(),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Pressing Enter renames the file to the given name", () => {
    fireEvent.change(inputBox, { target: { value: "file1.py" } });
    fireEvent.keyDown(inputBox, { key: "Enter" });
    const expectedActions = [
      updateComponentName({ key: 0, extension: "py", name: "file1" }),
      closeRenameFileModal(),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Duplicate file names throws error", () => {
    fireEvent.change(inputBox, { target: { value: "my_file.py" } });
    fireEvent.click(saveButton);
    const expectedActions = [setNameError("filePanel.errors.notUnique")];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Reserved file names throws error", () => {
    fireEvent.change(inputBox, { target: { value: "INSTRUCTIONS.md" } });
    fireEvent.click(saveButton);
    const expectedActions = [
      setNameError("filePanel.errors.reservedFileName", {
        fileName: "INSTRUCTIONS.md",
      }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Unchanged file name does not throw error", () => {
    fireEvent.click(saveButton);
    const expectedActions = [
      updateComponentName({ key: 0, extension: "py", name: "main" }),
      closeRenameFileModal(),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Unsupported extension throws error", () => {
    fireEvent.change(inputBox, { target: { value: "file1.js" } });
    fireEvent.click(saveButton);
    const expectedActions = [
      setNameError("filePanel.errors.unsupportedExtension"),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
