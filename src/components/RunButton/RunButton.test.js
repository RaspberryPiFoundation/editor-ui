import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import RunButton from "./RunButton";

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {
  editor: {
    codeRunLoading: false,
  },
};
const store = mockStore(initialState);

test("Run button renders with expected button text", () => {
  render(
    <Provider store={store}>
      <RunButton buttonText="Run Code" />
    </Provider>,
  );
  expect(screen.queryByRole("button")).toHaveTextContent("Run Code");
});
