import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ClassPage from "./ClassPage";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of ClassPage", () => {
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
        <ClassPage />
      </div>
    </Provider>,
  );

  expect(screen.getByText("Year 8 Computer Science")).toBeInTheDocument();
});
