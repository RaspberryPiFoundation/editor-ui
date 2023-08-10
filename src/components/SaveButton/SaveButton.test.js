import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SaveButton from "./SaveButton";

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {
  editor: {
    codeRunTriggered: false,
  },
};
const store = mockStore(initialState);

test("Renders", () => {
  render(
    <Provider store={store}>
      <SaveButton />
    </Provider>,
  );
  expect(screen.queryByRole("button")).toHaveTextContent("saveButton.saved");
});
