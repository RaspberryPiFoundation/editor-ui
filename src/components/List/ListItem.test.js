import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import configureStore from "redux-mock-store";
import ListItem from "../List/ListItem";
import { Provider } from "react-redux";

const middlewares = [];
const mockStore = configureStore(middlewares);

const primaryText = "Primary";
const secondaryText = "Secondary";
const actions = [
  {
    text: "Action1",
  },
];

beforeEach(() => {
  const initialState = {};
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <ListItem
        primaryText={primaryText}
        secondaryText={secondaryText}
        actions={actions}
      />
    </Provider>,
  );
});

test("Renders the primary text", () => {
  expect(screen.queryByText(primaryText)).toBeInTheDocument();
});

test("Renders the secondary text if provided", () => {
  expect(screen.queryByText(secondaryText)).toBeInTheDocument();
});

test("Renders the actions", () => {
  const menuButton = screen.getAllByRole("button").pop();
  fireEvent.click(menuButton);
  expect(screen.queryByText(actions[0].text)).toBeInTheDocument();
});
