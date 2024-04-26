import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import ProjectComponentLoader from "./ProjectComponentLoader";
import { login } from "../utils/login";

const mockNavigate = jest.fn();

jest.mock("../utils/login");

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useLocation: () => "my-location",
  useNavigate: () => mockNavigate,
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

    it("redirects to new project identifier on editor-projectIdentifierChanged custom event", () => {
      act(() => {
        document.dispatchEvent(
          new CustomEvent("editor-projectIdentifierChanged", {
            detail: "new-project-identifier",
          }),
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        "/ja-JP/projects/new-project-identifier",
      );
    });
  });

  describe("when user is logged in", () => {
    beforeEach(() => {
      const store = setupStore({
        editor: {
          project: "my-project",
        },
        auth: {
          user: {},
        },
      });
      renderComponent(store);
    });

    it("does not call login() when editor-logIn event is received", () => {
      act(() => {
        document.dispatchEvent(new CustomEvent("editor-logIn"));
      });

      expect(login).not.toHaveBeenCalled();
    });
  });
});
