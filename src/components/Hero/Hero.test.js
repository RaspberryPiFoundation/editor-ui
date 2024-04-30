import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import Hero from "./Hero";

const middlewares = [];
const mockStore = configureStore(middlewares);

const initialState = {
  auth: {
    user: {
      access_token: "1234",
    },
  },
};
const store = mockStore(initialState);

describe("Hero Component", () => {
  test("renders without crashing", () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );
  });

  test("renders correct title", async () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );

    expect(
      await screen.findByText(/landingPage.hero.title/i),
    ).toBeInTheDocument();
  });

  test("renders create school button", async () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );

    expect(
      await screen.findByText(/landingPage.hero.createSchool/i),
    ).toBeInTheDocument();
  });

  test("not renders login button when user is not logged in", async () => {
    const initialState = {
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);

    render(
      <BrowserRouter>
        <Provider store={store}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );

    const loginButton = await screen.findByText(/landingPage.hero.logIn/i);
    expect(loginButton).toBeInTheDocument();
  });
});
