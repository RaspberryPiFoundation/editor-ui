import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import InfoPanel from "./InfoPanel";

const renderInfoPanel = (props = {}) => {
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
        <InfoPanel {...props} />
      </MemoryRouter>
    </Provider>,
  );
};

describe("Info panel", () => {
  test("Links are rendered", () => {
    renderInfoPanel();

    expect(screen.queryByText("sidebar.help")).toBeInTheDocument();
    expect(screen.queryByText("sidebar.feedback")).toBeInTheDocument();
    expect(screen.queryByText("sidebar.privacy")).toBeInTheDocument();
  });

  test("Links have the expected default source", () => {
    renderInfoPanel();

    expect(screen.queryByText("sidebar.feedback")).toHaveAttribute(
      "href",
      "https://form.raspberrypi.org/f/code-editor-feedback",
    );
    expect(screen.queryByText("sidebar.help")).toHaveAttribute(
      "href",
      "https://help.editor.raspberrypi.org/hc/en-us",
    );
  });

  test("Uses the supplied feedback form source", () => {
    renderInfoPanel({
      feedbackFormUrl: "https://form.raspberrypi.org/4873801",
    });

    expect(screen.queryByText("sidebar.feedback")).toHaveAttribute(
      "href",
      "https://form.raspberrypi.org/4873801",
    );
  });

  test.each([
    `java${"script"}:alert(1)`,
    "http://example.com",
    "ftp://example.com",
    "not-a-url",
    "",
  ])(
    "Falls back to the default feedback form for invalid feedback form source %p",
    (feedbackFormUrl) => {
      renderInfoPanel({ feedbackFormUrl });

      expect(screen.queryByText("sidebar.feedback")).toHaveAttribute(
        "href",
        "https://form.raspberrypi.org/f/code-editor-feedback",
      );
    },
  );
});
