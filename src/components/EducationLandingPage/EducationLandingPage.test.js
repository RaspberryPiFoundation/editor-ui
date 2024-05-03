import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EducationLandingPage from "./EducationLandingPage";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of EducationLandingPage", () => {
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
        <EducationLandingPage />
      </div>
    </Provider>,
  );

  expect(screen.getByTestId("education-landing-page")).toBeInTheDocument();
});
