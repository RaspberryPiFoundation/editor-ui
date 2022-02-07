import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { toHaveAttribute } from "@testing-library/jest-dom";
import { Provider } from 'react-redux';
import RunnerControls from "./RunnerControls";
import configureStore from "redux-mock-store";

const middlewares = []
const mockStore = configureStore(middlewares)

test("Run button shows when code is not running", () => {
    const initialState = {
        editor: {
            codeRunTriggered: false,
            codeRunStopped: false
        }
    }
    const store = mockStore(initialState)
    const { getByText } = render(<Provider store={store}><RunnerControls /></Provider>);
    const runnerControls = getByText(/Code/);
    expect(runnerControls.textContent).toEqual("Run Code");
})

test("Stop button shows when code is running", () => {
    const initialState = {
        editor: {
            codeRunTriggered: true,
            codeRunStopped: false
        }
    }
    const store = mockStore(initialState)
    const { getByText } = render(<Provider store={store}><RunnerControls /></Provider>);
    const runnerControls = getByText(/Code/);
    expect(runnerControls.textContent).toEqual("Stop Code");
})
