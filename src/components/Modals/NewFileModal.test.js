import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import NewFileModal from "./NewFileModal";
import { addProjectComponent, closeNewFileModal, openFile, setNameError } from "../Editor/EditorSlice";

describe("Testing the new file modal", () => {
  let store;
  let saveButton;
  let inputBox;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py"
            }
          ],
          project_type: "python"
        },
        nameError: "",
        newFileModalShowing: true
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id='app'><NewFileModal /></div></Provider>)
    saveButton = screen.getByText('filePane.newFileModal.save')
    inputBox = screen.getByRole('textbox')
  })

  test('Modal renders',() => {
    expect(screen.queryByText('filePane.newFileModal.heading')).toBeInTheDocument()
  })

  test("Pressing save adds new file with the given name", () => {
    fireEvent.change(inputBox, {target: {value: "file1.py"}})
    inputBox.innerHTML = "file1.py";
    fireEvent.click(saveButton)
    const expectedActions = [
      addProjectComponent({extension: "py", name: "file1"}),
      openFile('file1.py'),
      closeNewFileModal()
    ]
    expect(store.getActions()).toEqual(expectedActions);
  })

  test("Duplicate file names throws error", () => {
    fireEvent.change(inputBox, {target: {value: "main.py"}})
    fireEvent.click(saveButton)
    const expectedActions = [setNameError("filePane.errors.notUnique")]
    expect(store.getActions()).toEqual(expectedActions);
  })

  test("Unsupported extension throws error", () => {
    fireEvent.change(inputBox, {target: {value: "file1.js"}})
    fireEvent.click(saveButton)
    const expectedActions = [setNameError("filePane.errors.unsupportedExtension")]
    expect(store.getActions()).toEqual(expectedActions);
  })
})
