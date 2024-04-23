import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectComponentLoader from "./ProjectComponentLoader";
import { matchMedia } from "mock-match-media";
import { login } from "../utils/login";

jest.mock("../hooks/useProjectPersistence", () => ({
  useProjectPersistence: jest.fn(),
}));

jest.mock("react-responsive", () => ({
  ...jest.requireActual("react-responsive"),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

jest.mock("../utils/login");

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useLocation: () => "my-location",
}));

let mockMediaQuery = (query) => {
  return matchMedia(query).matches;
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();

test("Renders editor", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      loading: "success",
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectComponentLoader match={{ params: {} }} />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.queryByTestId("editor-wc")).toBeInTheDocument();
});

test("handles editor-logIn custom event by calling login", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      loading: "success",
      project: "my-project",
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectComponentLoader match={{ params: {} }} />
      </MemoryRouter>
    </Provider>,
  );

  act(() => {
    document.dispatchEvent(new CustomEvent("editor-logIn"));
  });

  expect(login).toHaveBeenCalledWith({
    location: "my-location",
    project: "my-project",
  });
});
