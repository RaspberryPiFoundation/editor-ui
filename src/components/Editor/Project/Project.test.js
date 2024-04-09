import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Project from "./Project";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const middlewares = [];
const mockStore = configureStore(middlewares);

describe("When the project is rendered", () => {
  beforeEach(() => {
    const store = mockStore({});
    render(
      <Provider store={store}>
        <Project />
      </Provider>,
    );
  });

  test("has the expected container class", () => {
    const editor = screen.getByTestId("editor-wc");
    const ancestor = editor.closest(".proj-container");
    expect(ancestor).toBeTruthy();
  });
});
