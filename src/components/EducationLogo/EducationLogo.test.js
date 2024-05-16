import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EducationLogo from "./EducationLogo";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of EducationLogo", () => {
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
        <EducationLogo />
      </div>
    </Provider>,
  );

  const EducationLogoComponent = screen.getByTestId("education-logo");

  expect(EducationLogoComponent).toHaveClass("education-logo-wrapper");
});
