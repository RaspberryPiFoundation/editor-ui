import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SchoolOnboarding from "./SchoolOnboarding";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of School Onboarding page", () => {
  const initialState = {};
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <div id="app">
        <SchoolOnboarding />
      </div>
    </Provider>,
  );

  const SchoolOnboardingComponent = screen.getByTestId("school-onboarding");

  expect(SchoolOnboardingComponent).toHaveClass("school-onboarding-wrapper");
});
