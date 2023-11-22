import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import GlobalNav from "./GlobalNav";

test("Global nav renders", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    auth: {},
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <GlobalNav />
    </Provider>,
  );
  expect(screen.queryByText("Raspberry Pi Foundation")).toBeInTheDocument();
});

test("When not logged in renders generic profile image", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    auth: {},
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <GlobalNav />
    </Provider>,
  );
  expect(
    screen.queryByAltText("globalNav.accountMenuDefaultAltText"),
  ).toBeInTheDocument();
});

test("When logged in renders user's profile image", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    auth: {
      user: {
        profile: {
          picture: "image_url",
        },
      },
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <GlobalNav />
    </Provider>,
  );
  expect(
    screen.queryByAltText("globalNav.accountMenuProfileAltText"),
  ).toHaveAttribute("src", "image_url");
});
