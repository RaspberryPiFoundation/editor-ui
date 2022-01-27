import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { toHaveAttribute } from "@testing-library/jest-dom";
import { Provider } from 'react-redux';
import StopButton from "./StopButton";
import RunButton from "./RunButton";
import store from '../../app/store';
import { codeRunHandled, triggerCodeRun } from '../Editor/EditorSlice'


test("Clicking stop button without input box sets codeRunStopped to true", () => {
    store.dispatch(codeRunHandled())
    store.dispatch(triggerCodeRun())
    
    const { getByText } = render(<Provider store={store}><StopButton buttonText="Stop Code" /></Provider>);
    const stopButton = getByText(/Stop Code/);
    fireEvent.click(stopButton);
    expect(store.getState().editor.codeRunStopped).toEqual(true);
})

test("Clicking stop button with input box handles code run", () => {
    store.dispatch(codeRunHandled())
    store.dispatch(triggerCodeRun())

    const { getByText } = render(
    <Provider store={store}>
        {/* <RunButton buttonText="Run Code" /> */}
        <StopButton buttonText="Stop Code" />
        <span id="input" contentEditable="true">hello world</span>
    </Provider>
    );
   
    const stopButton = getByText(/Stop Code/);
    fireEvent.click(stopButton);
    expect(store.getState().editor.codeRunStopped).toEqual(false);
    expect(store.getState().editor.codeRunTriggered).toEqual(false);
})

test("Clicking stop button removes editable input box but keeps input text", () => {
    const { getByText } = render(<Provider store={store}><StopButton buttonText="Stop Code" /><span id="input" contentEditable="true">hello world</span></Provider>);
    const stopButton = getByText(/Stop Code/);
    const inputSpan = document.getElementById("input");
    // expect(inputSpan).toEqual(<span id="input" contentEditable="true">hello world</span>);
    fireEvent.click(stopButton);
    expect(inputSpan.textContent).toEqual("hello world");
    expect(inputSpan).not.toHaveAttribute("contentEditable", "true");
    expect(inputSpan).not.toHaveAttribute("id", "input");
})