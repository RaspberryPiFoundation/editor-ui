import React from "react";
import { render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PythonRunner from "./PythonRunner";

const middlewares = []
const mockStore = configureStore(middlewares)


test("Input function in code makes editable input box appear", () => {
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
    expect(document.getElementById("input")).toHaveAttribute("contentEditable", "true");
})