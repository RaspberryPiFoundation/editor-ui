import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import SidebarBar from "./SidebarBar";

const toggleOption = vi.fn();

const mockStore = configureStore([]);
const initialState = {
  editor: {
    project: {
      components: [],
    },
  },
};
const store = mockStore(initialState);

const menuOptions = (instructions = false) => {
  return [
    {
      name: "file",
      title: "file_button",
      position: "top",
      panel: () => {},
    },
    {
      name: "projects",
      position: "top",
      title: "projects_button",
      panel: () => {},
    },
    ...(instructions
      ? [
          {
            name: "instructions",
            position: "top",
            title: "instructions_button",
            panel: () => {},
          },
        ]
      : []),
  ];
};

const menuOptionsWithoutFile = () => {
  return [
    {
      name: "projects",
      position: "top",
      title: "projects_button",
      panel: () => {},
    },
    {
      name: "download",
      position: "top",
      title: "download_button",
      panel: () => {},
    },
  ];
};

describe("SidebarBar", () => {
  describe("Without instructions", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <SidebarBar menuOptions={menuOptions()} toggleOption={toggleOption} />
        </Provider>,
      );
    });

    test("Clicking expand button opens file panel", () => {
      const expandButton = screen.getByTitle("sidebar.expand");
      fireEvent.click(expandButton);
      expect(toggleOption).toHaveBeenCalledWith("file");
    });

    test("Clicking projects button opens projects panel", () => {
      const projectsButton = screen.getByTitle("projects_button");
      fireEvent.click(projectsButton);
      expect(toggleOption).toHaveBeenCalledWith("projects");
    });
  });

  describe("With instructions", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <SidebarBar
            menuOptions={menuOptions(true)}
            toggleOption={toggleOption}
            instructions={[
              {
                title: "My testing title",
                content: "My testing content",
              },
            ]}
          />
        </Provider>,
      );
    });

    test("Clicking expand button opens instructions panel", () => {
      const expandButton = screen.getByTitle("sidebar.expand");
      fireEvent.click(expandButton);
      expect(toggleOption).toHaveBeenCalledWith("instructions");
    });
  });

  describe("Without file option", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <SidebarBar
            menuOptions={menuOptionsWithoutFile()}
            toggleOption={toggleOption}
          />
        </Provider>,
      );
    });

    test("Clicking expand button falls back to the first top panel", () => {
      const expandButton = screen.getByTitle("sidebar.expand");
      fireEvent.click(expandButton);
      expect(toggleOption).toHaveBeenCalledWith("projects");
    });
  });

  describe("Sidebar tabs", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <SidebarBar
            menuOptions={menuOptions()}
            option="projects"
            toggleOption={toggleOption}
          />
        </Provider>,
      );
    });

    test("Options are tabs in a single tablist, excluding the collapse button", () => {
      expect(screen.getAllByRole("tablist")).toHaveLength(1);
      expect(screen.getAllByRole("tab")).toHaveLength(2);
      expect(screen.getByTitle("sidebar.collapse")).not.toHaveAttribute("role");
    });

    test("Selected tab is marked and controls its panel", () => {
      const selected = screen.getByTitle("projects_button");
      expect(selected).toHaveAttribute("aria-selected", "true");
      expect(selected).toHaveAttribute(
        "aria-controls",
        "sidebar-panel-projects",
      );
      expect(selected).toHaveAttribute("tabindex", "0");
      expect(screen.getByTitle("file_button")).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(screen.getByTitle("file_button")).toHaveAttribute(
        "tabindex",
        "-1",
      );
    });

    test("Arrow keys, Home and End move focus between tabs", () => {
      const file = screen.getByTitle("file_button");
      const projects = screen.getByTitle("projects_button");
      fireEvent.keyDown(projects, { key: "ArrowUp" });
      expect(file).toHaveFocus();
      fireEvent.keyDown(file, { key: "ArrowUp" });
      expect(projects).toHaveFocus();
      fireEvent.keyDown(projects, { key: "Home" });
      expect(file).toHaveFocus();
      fireEvent.keyDown(file, { key: "End" });
      expect(projects).toHaveFocus();
    });

    test("Arrow keys open the panel of the newly focused tab", () => {
      toggleOption.mockClear();
      fireEvent.keyDown(screen.getByTitle("projects_button"), {
        key: "ArrowDown",
      });
      expect(toggleOption).toHaveBeenCalledWith("file");
    });

    test("Moving to the already selected tab does not close its panel", () => {
      toggleOption.mockClear();
      fireEvent.keyDown(screen.getByTitle("projects_button"), { key: "End" });
      expect(toggleOption).not.toHaveBeenCalled();
    });
  });
});
