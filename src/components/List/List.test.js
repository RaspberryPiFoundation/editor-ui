import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import configureStore from "redux-mock-store";
import List from "./List";
import { Provider } from "react-redux";

const middlewares = [];
const mockStore = configureStore(middlewares);

const message = "no records";
const primaryText = "User name";
const secondaryText = "username";
const actionText = "action1";
const actions = [
  {
    text: actionText,
  },
];

const items = [
  {
    primaryText: primaryText,
    secondaryText: secondaryText,
    actions,
  },
  {
    primaryText: primaryText,
    secondaryText: secondaryText,
    actions,
  },
  {
    primaryText: primaryText,
    secondaryText: secondaryText,
    actions,
  },
];

beforeEach(() => {
  const initialState = {};
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <List noItemMessage={message} items={items} />
    </Provider>
  );
});

test("Renders the items", () => {
  expect(screen.getAllByText(primaryText)).toHaveLength(items.length);
});

test("Renders only one menu at a time", () => {
  const menuButtons = screen.getAllByRole("button");
  fireEvent.click(menuButtons[0]);
  fireEvent.click(menuButtons[1]);
  expect(screen.getAllByText(actionText)).toHaveLength(1);
});

test("Closes menu on clicking again", () => {
  const menuButtons = screen.getAllByRole("button");
  fireEvent.click(menuButtons[0]);
  fireEvent.click(menuButtons[0]);
  expect(screen.queryAllByText(actionText)).toEqual([]);
});
