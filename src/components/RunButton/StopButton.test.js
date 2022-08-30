import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from 'react-redux';
import StopButton from "./StopButton";
import store from '../../app/store';
import { codeRunHandled, triggerCodeRun } from '../Editor/EditorSlice'


test("Clicking stop button sets codeRunStopped to true", () => {
  store.dispatch(codeRunHandled())
  store.dispatch(triggerCodeRun())

  const { getByText } = render(
  <Provider store={store}>
      <StopButton buttonText="Stop Code" />
  </Provider>);

  const stopButton = getByText(/Stop Code/);
  fireEvent.click(stopButton);

  expect(store.getState().editor.codeRunStopped).toEqual(true);
})

test("Clicking stop button changes it to 'Stopping...' after 100ms", () => {
  store.dispatch(codeRunHandled())
  store.dispatch(triggerCodeRun())

  const { getByText } = render(
  <Provider store={store}>
      <StopButton buttonText="Stop Code" />
  </Provider>
  );
  const stopButton = getByText(/Stop Code/);
  fireEvent.click(stopButton);
  expect(stopButton.textContent).toEqual("Stop Code")
  new Promise(resolve => setTimeout(resolve, 100)).then( () =>
    expect(stopButton.textContent).toEqual("Stopping...")
  )
})
