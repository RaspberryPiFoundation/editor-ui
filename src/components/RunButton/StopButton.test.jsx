import React from "react";
import { act, render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import StopButton from "./StopButton";
import store from "../../app/store";
import { codeRunHandled, triggerCodeRun } from "../../redux/EditorSlice";

const runStoppedHandler = vi.fn();
const onRunStopped = (e) => runStoppedHandler(e.detail);

beforeAll(() => {
  document.addEventListener("editor-runStopped", onRunStopped);
});

afterAll(() => {
  document.removeEventListener("editor-runStopped", onRunStopped);
});

beforeEach(() => {
  vi.useFakeTimers();
  runStoppedHandler.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

test("Clicking stop button sets codeRunStopped to true", () => {
  store.dispatch(codeRunHandled());
  store.dispatch(triggerCodeRun());

  const component = render(
    <Provider store={store}>
      <StopButton buttonText="Stop Code" />
    </Provider>,
  );

  const stopButton = component.getByRole("button");
  fireEvent.click(stopButton);

  expect(store.getState().editor.codeRunStopped).toEqual(true);
});

test("Clicking stop button changes it to 'Stopping...' after a time out", () => {
  store.dispatch(codeRunHandled());
  store.dispatch(triggerCodeRun());

  const component = render(
    <Provider store={store}>
      <StopButton buttonText="Stop Code" />
    </Provider>,
  );
  const stopButton = component.getByRole("button");
  expect(stopButton.textContent).toEqual("Stop Code");

  fireEvent.click(stopButton);
  expect(stopButton.textContent).toEqual("Stop Code");

  act(() => {
    vi.runAllTimers();
  });
  expect(stopButton.textContent).toEqual("runButton.stopping");
});

test("Clicking stop button dispatches editor-runStopped with the embedded context", () => {
  store.dispatch(codeRunHandled());
  store.dispatch(triggerCodeRun());

  const component = render(
    <Provider store={store}>
      <StopButton buttonText="Stop Code" embedded />
    </Provider>,
  );

  fireEvent.click(component.getByRole("button"));

  expect(runStoppedHandler).toHaveBeenCalledWith({ embedded: true });
});
