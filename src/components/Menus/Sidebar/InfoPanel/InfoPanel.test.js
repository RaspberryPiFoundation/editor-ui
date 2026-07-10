import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import Modal from "react-modal";

import InfoPanel from "./InfoPanel";

const defaultInitialState = {
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

const renderInfoPanel = (props = {}, initialState = defaultInitialState) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
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

  test("The licenses link is not rendered for non-Scratch projects", () => {
    renderInfoPanel();

    expect(screen.queryByText("sidebar.licenses")).not.toBeInTheDocument();
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

  test("the licenses modal is not rendered for non-Scratch projects", () => {
    renderInfoPanel();

    expect(screen.queryByText("sidebar.licenses")).not.toBeInTheDocument();
  });
});

describe("when the project is a Scratch project", () => {
  const scratchInitialState = {
    editor: {
      project: {
        project_type: "code_editor_scratch",
      },
    },
  };

  beforeAll(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "app");
    global.document.body.appendChild(root);
    Modal.setAppElement("#app");
  });

  test("the licenses link is rendered", () => {
    renderInfoPanel({}, scratchInitialState);

    expect(screen.queryByText("sidebar.licenses")).toBeInTheDocument();
  });

  test("the licenses modal opens when the licenses link is clicked", () => {
    renderInfoPanel({}, scratchInitialState);

    fireEvent.click(screen.getByText("sidebar.licenses"));

    expect(screen.queryByText("Scratch Editor")).toBeInTheDocument();
    expect(screen.queryByText("Scratch Frame")).toBeInTheDocument();
  });
});
