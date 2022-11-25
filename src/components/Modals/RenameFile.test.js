import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import RenameFile from "./RenameFile";
import { setNameError, updateComponentName, closeRenameFileModal } from "../Editor/EditorSlice";

describe("Testing the new file modal", () => {
    let store;
    let inputBox;
    let saveButton;
    let getByText;

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
                modals: {
                    renameFile: {
                        name: 'main',
                        ext: 'py',
                        fileKey: 0
                    }
                },
                renameFileModalShowing: true
            }
        }
        store = mockStore(initialState);
        ({getByText, getByRole} = render(<Provider store={store}><div id='app'><RenameFile currentName='main' currentExtension='py' fileKey={0} /></div></Provider>))
        inputBox = document.getElementById('name')
        saveButton = getByText('filePane.renameFileModal.save');
    })

    test('State being set displays the modal', () => {
      expect(getByText('filePane.renameFileModal.heading')).not.toBeNull()
    })

    test('Input box initially contains original file name', () => {
      expect(inputBox.value).toEqual('main.py')
    })

    test("Pressing save renames the file to the given name", () => {
        fireEvent.change(inputBox, {target: {value: "file1.py"}})
        inputBox.innerHTML = "file1.py";
        fireEvent.click(saveButton)
        const expectedActions = [
            updateComponentName({key: 0, extension: "py", name: "file1"}),
            closeRenameFileModal()
        ]
        expect(store.getActions()).toEqual(expectedActions);
    })

    test("Duplicate file names throws error", () => {
        fireEvent.change(inputBox, {target: {value: "my_file.py"}})
        fireEvent.click(saveButton)
        const expectedActions = [setNameError('filePane.errors.notUnique')]
        expect(store.getActions()).toEqual(expectedActions);
    })

    test("Unchanged file name does not throw error", () => {
      fireEvent.click(saveButton)
      const expectedActions = [
        updateComponentName({key: 0, extension: "py", name: "main"}),
        closeRenameFileModal()
    ]
      expect(store.getActions()).toEqual(expectedActions);
    })

    test("Unsupported extension throws error", () => {
        fireEvent.change(inputBox, {target: {value: "file1.js"}})
        fireEvent.click(saveButton)
        const expectedActions = [setNameError("filePane.errors.unsupportedExtension")]
        expect(store.getActions()).toEqual(expectedActions);
    })
})
