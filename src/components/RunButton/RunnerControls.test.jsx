import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import RunnerControls from "./RunnerControls";
import configureStore from "redux-mock-store";
import store from "../../app/store";
import {
  codeRunHandled,
  loadingRunner,
  setLoadedRunner,
  triggerCodeRun,
} from "../../redux/EditorSlice";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("Run button shows when code is not running", () => {
  const initialState = {
    editor: {
      codeRunTriggered: false,
      codeRunStopped: false,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <RunnerControls />
    </Provider>,
  );
  const runButton = screen.queryByText("runButton.run");
  expect(runButton).toBeInTheDocument();
});

test("Stop button shows when code is running", () => {
  const initialState = {
    editor: {
      codeRunTriggered: true,
      codeRunStopped: false,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <RunnerControls />
    </Provider>,
  );
  const stopButton = screen.queryByText("runButton.stop");
  expect(stopButton).toBeInTheDocument();
});

describe("When running and stopping code", () => {
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
    store.dispatch(codeRunHandled());
    store.dispatch(loadingRunner("pyodide"));
    store.dispatch(setLoadedRunner("pyodide"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderControls = (props = {}) =>
    render(
      <Provider store={store}>
        <RunnerControls {...props} />
      </Provider>,
    );

  test("Clicking run triggers a code run", () => {
    renderControls();
    fireEvent.click(screen.getByRole("button"));
    expect(store.getState().editor.codeRunTriggered).toEqual(true);
  });

  test("The button keeps focus after clicking run", () => {
    renderControls();
    const button = screen.getByRole("button");
    button.focus();
    fireEvent.click(button);

    expect(button).toHaveTextContent("runButton.stop");
    expect(button).toHaveFocus();
  });

  test("Clicking stop sets codeRunStopped to true", () => {
    store.dispatch(triggerCodeRun());
    renderControls();
    fireEvent.click(screen.getByRole("button"));
    expect(store.getState().editor.codeRunStopped).toEqual(true);
  });

  test("Clicking stop changes it to 'Stopping...' after a time out", () => {
    store.dispatch(triggerCodeRun());
    renderControls();
    const button = screen.getByRole("button");

    fireEvent.click(button);
    expect(button).toHaveTextContent("runButton.stop");

    act(() => {
      vi.runAllTimers();
    });
    expect(button).toHaveTextContent("runButton.stopping");
  });

  test("Clicking stop dispatches editor-runStopped with the embedded context", () => {
    store.dispatch(triggerCodeRun());
    renderControls({ embedded: true });
    fireEvent.click(screen.getByRole("button"));
    expect(runStoppedHandler).toHaveBeenCalledWith({ embedded: true });
  });
});
