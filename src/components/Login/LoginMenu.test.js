import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import LoginMenu from "./LoginMenu";

jest.mock("../../utils/apiCallHandler");

describe("When not logged in", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Provider store={store}>
          <LoginMenu />
        </Provider>
      </MemoryRouter>,
    );
  });

  test("Login button renders", () => {
    expect(
      screen.queryByText("globalNav.accountMenu.login"),
    ).toBeInTheDocument();
  });

  test("My profile does not render", () => {
    expect(
      screen.queryByText("globalNav.accountMenu.profile"),
    ).not.toBeInTheDocument();
  });

  test("My projects does not render", () => {
    expect(
      screen.queryByText("globalNav.accountMenu.projects"),
    ).not.toBeInTheDocument();
  });
});

describe("When logged in", () => {
  let store;
  const renderLoginMenu = () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Provider store={store}>
          <LoginMenu />
        </Provider>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
      },
      auth: {
        user: {
          profile: {
            profile: "profile_url",
          },
          id_token: "token",
          access_token: "access-token",
        },
      },
    };
    store = mockStore(initialState);
  });

  test("Logout button renders", () => {
    renderLoginMenu();
    expect(
      screen.queryByText("globalNav.accountMenu.logout"),
    ).toBeInTheDocument();
  });

  test("My profile renders with correct link", () => {
    renderLoginMenu();
    expect(screen.queryByText("globalNav.accountMenu.profile")).toHaveAttribute(
      "href",
      "profile_url/edit",
    );
  });

  test("My projects renders with correct link", () => {
    renderLoginMenu();
    expect(
      screen.queryByText("globalNav.accountMenu.projects"),
    ).toHaveAttribute("href", "/ja-JP/projects");
  });
});
