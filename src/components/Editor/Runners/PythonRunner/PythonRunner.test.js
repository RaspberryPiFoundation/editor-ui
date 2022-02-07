import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PythonRunner from "./PythonRunner";
import store from '../../../../app/store';

describe ("Testing basic input span functionality", () => {
    let input;
    let fakeStore;
    let stopButton;

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
                    ]
                },
                codeRunTriggered: true
            }
        }
        fakeStore = mockStore(initialState);
        const {getByText} = render(<Provider store={fakeStore}><PythonRunner/></Provider>);
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
                ]
            },
            codeRunTriggered: true
        }
    }
    const fakeStore = mockStore(initialState);
    const { getByText } = render(<Provider store={fakeStore}><PythonRunner /></Provider>);
    expect(document.getElementById("input")).toBeNull()
    
})

// test("Clicking stop button with input box handles code run", () => {
//     const middlewares = []
//     const mockStore = configureStore(middlewares)
//     const initialState = {
//         editor: {
//             project: {
//                 components: [
//                     {
//                         content: "input()"
//                     }
//                 ]
//             },
//             codeRunTriggered: true,
//             codeRunStopped: true
//         }
//     }
//     const fakeStore = mockStore(initialState);
//     const { getByText } = render(<Provider store={store}><PythonRunner /></Provider>);
// // Try something from https://github.com/redux-things/redux-actions-assertions?
//     expect(fakeStore.getState().editor.codeRunStopped).toEqual(false);
//     expect(fakeStore.getState().editor.codeRunTriggered).toEqual(false);
// })
