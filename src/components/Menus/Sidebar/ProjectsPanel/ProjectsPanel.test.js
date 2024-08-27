import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import ProjectsPanel from "./ProjectsPanel";

const initialState = {
  editor: {
    project: {
      components: [{ name: "main", extension: "py" }],
    },
  },
};

const renderProjectsPanel = (state) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({ ...initialState, ...state });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectsPanel t={() => {}} />
      </MemoryRouter>
    </Provider>,
  );
};

describe("Projects Panel", () => {
  describe("When not logged in", () => {
    beforeEach(() => {
      renderProjectsPanel({});
    });

    test("Projects button is not visible", () => {
      expect(
        screen.queryByText("projectsPanel.yourProjectsButton"),
      ).not.toBeInTheDocument();
    });

    test("Project name is visible", () => {
      expect(screen.queryByText("projectName.label")).toBeInTheDocument();
    });

    test("Project type is visible", () => {
      expect(screen.queryByText("projectName.label")).toBeInTheDocument();
    });

    test("Download button is visible", () => {
      expect(screen.queryByText("header.download")).toBeInTheDocument();
    });
  });

  describe("When logged in", () => {
    beforeEach(() => {
      renderProjectsPanel({
        auth: {
          user: { access_token: "39a09671-be55-4847-baf5-8919a0c24a25" },
        },
      });
    });

    test("Projects button is visible", () => {
      expect(
        screen.queryByText("projectsPanel.yourProjectsButton"),
      ).toBeInTheDocument();
    });
  });

  describe("When not read only", () => {
    beforeEach(() => {
      renderProjectsPanel({
        editor: {
          ...initialState.editor,
          readOnly: false,
        },
      });
    });

    test("Project name is editable", () => {
      expect(screen.queryByTitle("header.renameProject")).toBeInTheDocument();
    });
  });

  describe("When read only", () => {
    beforeEach(() => {
      renderProjectsPanel({
        editor: {
          ...initialState.editor,
          readOnly: true,
        },
      });
    });

    test("Project name is not editable", () => {
      expect(
        screen.queryByTitle("header.renameProject"),
      ).not.toBeInTheDocument();
    });
  });
});
