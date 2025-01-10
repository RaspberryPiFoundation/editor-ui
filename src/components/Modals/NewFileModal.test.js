import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import NewFileModal from "./NewFileModal";
import {
  addProjectComponent,
  closeNewFileModal,
  openFile,
  setNameError,
} from "../../redux/EditorSlice";

describe("Testing the new file modal", () => {
  let store;
  let saveButton;
  let inputBox;

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
          ],
          project_type: "python",
        },
        nameError: "",
        newFileModalShowing: true,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <NewFileModal />
        </div>
      </Provider>,
    );
    saveButton = screen.getByText("filePanel.newFileModal.addFile");
    inputBox = screen.getByRole("textbox");
  });

  test("Modal renders", () => {
    expect(
      screen.queryByText("filePanel.newFileModal.heading"),
    ).toBeInTheDocument();
  });

  test("Pressing save adds new file with the given name", () => {
    fireEvent.change(inputBox, { target: { value: "file1.py" } });
    fireEvent.click(saveButton);
    const expectedActions = [
      addProjectComponent({ extension: "py", name: "file1" }),
      openFile("file1.py"),
      closeNewFileModal(),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Pressing Enter adds new file with the given name", () => {
    fireEvent.change(inputBox, { target: { value: "file1.py" } });
    fireEvent.keyDown(inputBox, { key: "Enter" });
    const expectedActions = [
      addProjectComponent({ extension: "py", name: "file1" }),
      openFile("file1.py"),
      closeNewFileModal(),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Duplicate file names throws error", () => {
    fireEvent.change(inputBox, { target: { value: "main.py" } });
    fireEvent.click(saveButton);
    const expectedActions = [setNameError("filePanel.errors.notUnique")];
    expect(store.getActions()).toEqual(expectedActions);
  });

  test("Reserved file name throws error", () => {
    fireEvent.change(inputBox, { target: { value: "INSTRUCTIONS.md" } });
    fireEvent.click(saveButton);
    const expectedActions = [
      setNameError("filePanel.errors.reservedFileName", {
        fileName: "INSTRUCTIONS.md",
      }),
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
