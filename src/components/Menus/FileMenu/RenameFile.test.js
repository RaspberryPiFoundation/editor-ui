import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import RenameFile from "./RenameFile";
import { setNameError, updateComponentName } from "../../Editor/EditorSlice";

describe("Testing the new file modal", () => {
    let store;
    let inputBox;
    let saveButton;
    let getByText;
    let getByRole;

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
                        },
                        {
                          name: "my_file",
                          extension: "py"
                        }
                    ],
                    project_type: "python"
                },
                nameError: "",
            }
        }
        store = mockStore(initialState);
        ({getByText, getByRole} = render(<Provider store={store}><div id='app'><RenameFile currentName='main' currentExtension='py' fileKey={0} /></div></Provider>))
        const editNameButton = getByRole('button');
        fireEvent.click(editNameButton);
        inputBox = document.getElementById('name')
        saveButton = getByText('filePane.renameFileModal.save');
    })

    test('Clicking the edit file name button opens the modal', () => {
      expect(getByText('filePane.renameFileModal.heading')).not.toBeNull()
    })

    test('Input box initially contains original file name', () => {
      expect(inputBox.value).toEqual('main.py')
    })

    test("Pressing save renames the file to the given name", () => {
        fireEvent.change(inputBox, {target: {value: "file1.py"}})
        inputBox.innerHTML = "file1.py";
        fireEvent.click(saveButton)
        const expectedActions = [setNameError(""), updateComponentName({key: 0, extension: "py", name: "file1"})]
        expect(store.getActions()).toEqual(expectedActions);
    })

    test("Duplicate file names throws error", () => {
        fireEvent.change(inputBox, {target: {value: "my_file.py"}})
        fireEvent.click(saveButton)
        const expectedActions = [setNameError(""), setNameError('filePane.errors.notUnique')]
        expect(store.getActions()).toEqual(expectedActions);
    })

    test("Unchanged file name does not throw error", () => {
      fireEvent.click(saveButton)
      const expectedActions = [setNameError(""), updateComponentName({key: 0, extension: "py", name: "main"})]
      expect(store.getActions()).toEqual(expectedActions);
    })

    test("Unsupported extension throws error", () => {
        fireEvent.change(inputBox, {target: {value: "file1.js"}})
        fireEvent.click(saveButton)
        const expectedActions = [setNameError(""), setNameError("filePane.errors.unsupportedExtension")]
        expect(store.getActions()).toEqual(expectedActions);
    })
})
