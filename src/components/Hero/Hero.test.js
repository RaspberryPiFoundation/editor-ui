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

  test("renders correct title", () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Same great code editor, now in your classroom/i),
    ).toBeInTheDocument();
  });

  test("renders create school button", () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/Create a School/i)).toBeInTheDocument();
  });

  test("not renders login button when user is not logged in", () => {
    render(
      <BrowserRouter>
        <Provider store={mockStore}>
          <Hero />
        </Provider>
      </BrowserRouter>,
    );
    const loginButton = screen.getByText("Log in as a student");
    expect(loginButton).toBeInTheDocument();
  });
});
