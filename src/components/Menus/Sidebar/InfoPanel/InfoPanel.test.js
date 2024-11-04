import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import InfoPanel from "./InfoPanel";

describe("Info panel", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
            },
          ],
        },
      },
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <InfoPanel t={() => {}} />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Links are rendered", () => {
    expect(screen.queryByText("sidebar.help")).toBeInTheDocument();
    expect(screen.queryByText("sidebar.feedback")).toBeInTheDocument();
    expect(screen.queryByText("sidebar.privacy")).toBeInTheDocument();
  });

  test("Links have the expected source", () => {
    expect(screen.queryByText("sidebar.feedback")).toHaveAttribute(
      "href",
      "https://form.raspberrypi.org/f/code-editor-feedback",
    );
    expect(screen.queryByText("sidebar.help")).toHaveAttribute(
      "href",
      "https://help.editor.raspberrypi.org/hc/en-us",
    );
  });
});
