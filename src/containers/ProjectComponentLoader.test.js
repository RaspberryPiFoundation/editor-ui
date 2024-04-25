import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectComponentLoader from "./ProjectComponentLoader";
import { login } from "../utils/login";

jest.mock("../utils/login");

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useLocation: () => "my-location",
}));

const setupStore = (initialState) => {
  const mockStore = configureStore([]);
  return mockStore(initialState);
};

const renderComponent = (store) => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectComponentLoader match={{ params: {} }} />
      </MemoryRouter>
    </Provider>,
  );
};

describe("ProjectComponentLoader", () => {
  describe("when user is not logged in", () => {
    beforeEach(() => {
      const store = setupStore({
        editor: {
          project: "my-project",
        },
        auth: {
          user: null,
        },
      });
      renderComponent(store);
    });

    it("Renders editor", () => {
      expect(screen.queryByTestId("editor-wc")).toBeInTheDocument();
    });

    it("calls login() when editor-logIn event is received", () => {
      act(() => {
        document.dispatchEvent(new CustomEvent("editor-logIn"));
      });

      expect(login).toHaveBeenCalledWith({
        location: "my-location",
        project: "my-project",
      });
    });
  });
});
