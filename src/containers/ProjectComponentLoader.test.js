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

describe("ProjectComponentLoader", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      editor: {
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
  });

  it("Renders editor", () => {
    expect(screen.queryByTestId("editor-wc")).toBeInTheDocument();
  });

  it("handles editor-logIn custom event by calling login", () => {
    act(() => {
      document.dispatchEvent(new CustomEvent("editor-logIn"));
    });

    expect(login).toHaveBeenCalledWith({
      location: "my-location",
      project: "my-project",
    });
  });
});
