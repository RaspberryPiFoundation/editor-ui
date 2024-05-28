import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import TextList from "./TextList";

const middlewares = [];
const mockStore = configureStore(middlewares);

test("presence of TextListShowing", () => {
  const initialState = {};
  const store = mockStore(initialState);

  const imageTextProps = {
    title: "TextList title",
    text: "TextList text",
  };

  render(
    <Provider store={store}>
      <div id="app">
        <TextList {...imageTextProps} />
      </div>
    </Provider>,
  );

  const TextListComponent = screen.getByTestId("text-list-slice");

  expect(TextListComponent).toHaveClass("text-list-slice");

  expect(screen.getByText(imageTextProps.title)).toBeInTheDocument();
  expect(screen.getByText(imageTextProps.text)).toBeInTheDocument();
});
