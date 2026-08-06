import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import RunnerControls from "./RunnerControls";
import configureStore from "redux-mock-store";

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
