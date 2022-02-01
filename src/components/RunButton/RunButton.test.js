import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RunButton from "./RunButton";

const middlewares = []
const mockStore = configureStore(middlewares)
const store = mockStore({})

test("Run button renders with expected button text", () => {
    const { getByText } = render(<Provider store={store}><RunButton buttonText="Run Code" /></Provider>)
    const runButton = getByText(/Code/)
    expect(runButton.textContent).toEqual("Run Code");
})