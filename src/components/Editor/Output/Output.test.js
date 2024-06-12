import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Output from "./Output";
import { MemoryRouter } from "react-router-dom";

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

let store;
let mockStore;
let initialState;

describe("Output component", () => {
  beforeEach(() => {
    const middlewares = [];
    mockStore = configureStore(middlewares);
    initialState = {
      editor: {
        project: {
          components: [],
        },
      },
      auth: {
        user,
      },
    };
  });

  test("renders", () => {
    const store = mockStore(initialState);
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Output />
        </MemoryRouter>
      </Provider>,
    );
    expect(container.lastChild).toHaveClass("proj-runner-container");
  });

  describe("when isEmbedded state is true", () => {
    beforeEach(() => {
      initialState.editor.isEmbedded = true;
      store = mockStore(initialState);
    });

    test("shows run bar", () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Output />
          </MemoryRouter>
        </Provider>,
      );
      expect(screen.queryByText("runButton.run")).toBeInTheDocument();
    });

    describe("when browserPreview is true in query string", () => {
      let originalLocation;

      beforeEach(() => {
        originalLocation = window.location;
        delete window.location;
        window.location = { search: "?browserPreview=true" };
      });

      afterEach(() => {
        window.location = originalLocation;
      });

      test("does not show run bar", () => {
        render(
          <Provider store={store}>
            <MemoryRouter>
              <Output />
            </MemoryRouter>
          </Provider>,
        );
        expect(screen.queryByText("runButton.run")).not.toBeInTheDocument();
      });
    });
  });

  describe("when isEmbedded state is false", () => {
    beforeEach(() => {
      initialState.editor.isEmbedded = false;
      store = mockStore(initialState);
    });

    test("does not show run bar", () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Output />
          </MemoryRouter>
        </Provider>,
      );
      expect(screen.queryByText("runButton.run")).not.toBeInTheDocument();
    });
  });
});
