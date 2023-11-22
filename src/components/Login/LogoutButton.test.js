import React from "react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import userManager from "../../utils/userManager";
import LogoutButton from "./LogoutButton";

jest.mock("../../utils/userManager", () => ({
  signoutRedirect: jest.fn(),
  removeUser: jest.fn(),
}));

let logoutButton;

const user = {
  id_token: "1234",
};

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {};
  const store = mockStore(initialState);
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Provider store={store}>
        <LogoutButton user={user} />
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
  expect(userManager.signoutRedirect).toBeCalledWith({
    id_token_hint: user.id_token,
  });
  expect(userManager.removeUser).toHaveBeenCalled();
});
