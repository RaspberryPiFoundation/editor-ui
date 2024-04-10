import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import TextImage from "./TextImage";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of TextImageShowing", () => {
  const initialState = {};
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <div id="app">
        <TextImage />
      </div>
    </Provider>,
  );

  const textImageComponent = screen.getByTestId("text-image-slice");

  expect(textImageComponent).toHaveClass("text-image-slice");
});
