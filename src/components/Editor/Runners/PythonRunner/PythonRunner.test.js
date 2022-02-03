import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PythonRunner from "./PythonRunner";

describe ("Testing basic input span functionality", () => {
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
        const store = mockStore(initialState);
        const runner = render(<Provider store={store}><PythonRunner/></Provider>);
        const input = document.getElementById("input");
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
        const input = document.getElementById("input");
        const inputText = 'hello world';
        input.innerText = inputText;
        fireEvent.keyDown(input, {key: 'Enter', code: 'Enter', charCode: 13})
        
        expect(input).not.toHaveAttribute("contentEditable", "true");
        expect(input.innerText).toBe(inputText+'\n');
    })

    // test("Pressing enter in the middle of the user's input does not insert an extra newline character", () => {
    //     const input = document.getElementById("input");
    //     const inputText = 'hello world';
    //     input.innerText = inputText;

    //     const selection = window.getSelection();
    //     const textNode = input.childNodes[0];
    //     const range = document.createRange();
    //     range.setStart(textNode, 5);
    //     range.collapse(true);
    //     selection.addRange(range);

    //     fireEvent.keyDown(input, {key: 'Enter', code: 'Enter', charCode: 13})
        
    //     expect(input.innerText).toBe(inputText+'\n');
    // })
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
    const store = mockStore(initialState);
    const { getByText } = render(<Provider store={store}><PythonRunner /></Provider>);
    expect(document.getElementById("input")).toBeNull()
    
})

