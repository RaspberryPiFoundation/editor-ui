import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import LogoLM from "./LogoLM";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of School Onboarding page", () => {
  const initialState = {
    auth: {
      user: {
        access_token: "1234",
      },
    },
  };
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <div id="app">
        <LogoLM />
      </div>
    </Provider>,
  );

  const LogoLMComponent = screen.getByTestId("logo-lm");

  expect(LogoLMComponent).toHaveClass("logo-lm-wrapper");
});
