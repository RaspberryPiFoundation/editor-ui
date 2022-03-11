import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';

import PythonRunner from "./PythonRunner";
import { codeRunHandled, setError} from "../../EditorSlice";

describe ("Testing basic input span functionality", () => {
    let input;
    let store;

    beforeEach(() => {
        const middlewares = []
        const mockStore = configureStore(middlewares)
        const initialState = {
            editor: {
                project: {
                    components: [
                        {
                            content: "input()"
                        }
                    ],
                    images: []
                },
                codeRunTriggered: true
            }
        }
        store = mockStore(initialState);
        const runner = render(<Provider store={store}><PythonRunner/></Provider>);
        input = document.getElementById("input");
    })

    test("Input function in code makes editable input box appear", () => {
        expect(input).toHaveAttribute("contentEditable", "true");
    })

    test("Input box has focus when it appears", () => {
        expect(input).toHaveFocus();
    })

    test("Clicking output pane transfers focus to input", () => {
        const outputPane = document.getElementsByClassName("pythonrunner-console")[0]
        fireEvent.click(outputPane);
        expect(input).toHaveFocus();
    })

    test("Pressing enter stops the input box being editable", () => {
        const inputText = 'hello world';
        input.innerText = inputText;
        fireEvent.keyDown(input, {key: 'Enter', code: 'Enter', charCode: 13})
        
        expect(input).not.toHaveAttribute("contentEditable", "true");
        expect(input.innerText).toBe(inputText+'\n');
    })
})

test("Input box not there when input function not called", () => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
            project: {
                components: [
                    {
                        content: "print('Hello')"
                    }
                ],
                images: []
            },
            codeRunTriggered: true
        }
    }
    const store = mockStore(initialState);
    const runner = render(<Provider store={store}><PythonRunner /></Provider>);
    expect(document.getElementById("input")).toBeNull()
    
})

describe ("Testing basic input span functionality", () => {
    let store;
    beforeEach(() => {
        const middlewares = []
        const mockStore = configureStore(middlewares)
        const initialState = {
            editor: {
                project: {
                    components: [
                        {
                            content: "input()"
                        }
                    ],
                    images: []
                },
                codeRunTriggered: true,
                codeRunStopped: true
            }
        }
        store = mockStore(initialState);
        const runner = render(<Provider store={store}><PythonRunner /></Provider>);
    })

    test("Stopping code with input dispatches codeRunHandled", () => {
        expect(document.getElementById("input")).toBeNull();
    })

    test("Stopping code with input sets error and handles code run", () => {
        const expectedActions = [setError(''), setError('Execution interrupted'), codeRunHandled()]
        expect(store.getActions()).toEqual(expectedActions);
    })
})
