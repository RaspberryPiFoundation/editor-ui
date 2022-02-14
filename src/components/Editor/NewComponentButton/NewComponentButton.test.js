import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';

import NewComponentButton from "./NewComponentButton";
import {addProjectComponent, setNameError} from "../EditorSlice"

describe("Testing the new file modal", () => {
    let store;
    let inputBox;
    let saveButton;

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
                    ]
                },
                nameError: "",
            }
        }
        store = mockStore(initialState);
        const {getByText} = render(<Provider store={store}><div id='root'><NewComponentButton /></div></Provider>)
        const button = getByText(/\+/);
        fireEvent.click(button);
        inputBox = document.getElementById('name')
        saveButton = getByText(/Save/);
    })

    test("Pressing save adds new file with the given name", () => {
        fireEvent.change(inputBox, {target: {value: "file1.py"}})
        inputBox.innerHTML = "file1.py";
        fireEvent.click(saveButton)
        const expectedActions = [setNameError(""), addProjectComponent({extension: "py", name: "file1"})]
        expect(store.getActions()).toEqual(expectedActions);
    })

    test("Duplicate file names throws error", () => {
        fireEvent.change(inputBox, {target: {value: "main.py"}})
        fireEvent.click(saveButton)
        const expectedActions = [setNameError(""), setNameError("File names must be unique.")]
        expect(store.getActions()).toEqual(expectedActions);
    })

    test("Unsupported extension throws error", () => {
        fireEvent.change(inputBox, {target: {value: "file1.js"}})
        fireEvent.click(saveButton)
        const expectedActions = [setNameError(""), setNameError("File names must end in '.py', '.html' or '.css'.")]
        expect(store.getActions()).toEqual(expectedActions);
    })
})