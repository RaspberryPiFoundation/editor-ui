import React from "react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import userManager from "../../utils/userManager";
import LogoutButton from "./LogoutButton";

jest.mock("../../utils/userManager", () => ({
  removeUser: jest.fn(),
}));

let logoutButton;

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
    },
    auth: {
      user: {},
    },
  };
  const store = mockStore(initialState);
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Provider store={store}>
        <LogoutButton />
      </Provider>
    </MemoryRouter>,
  );
  logoutButton = screen.queryByText("globalNav.accountMenu.logout");
});

test("Log out button shown", () => {
  expect(logoutButton).toBeInTheDocument();
});

test("Clicking log out button signs the user out", () => {
  fireEvent.click(logoutButton);
  expect(userManager.removeUser).toHaveBeenCalled();
});
