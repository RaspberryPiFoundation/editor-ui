import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import MobileProject from "./MobileProject";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const middlewares = [];
const mockStore = configureStore(middlewares);

describe("When the project is rendered", () => {
  beforeEach(() => {
    const store = mockStore({});
    render(
      <Provider store={store}>
        <MobileProject />
      </Provider>,
    );
  });

  test("has the expected class", () => {
    const editor = screen.getByTestId("editor-wc");
    expect(editor.parentElement).toHaveClass("proj-container--mobile");
  });
});
