import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import SidebarBar from "./SidebarBar";

const toggleOption = jest.fn();

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
      name: "home",
      position: "top",
      title: "home_button",
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

    test("Clicking home button opens home panel", () => {
      const homeButton = screen.getByTitle("home_button");
      fireEvent.click(homeButton);
      expect(toggleOption).toHaveBeenCalledWith("home");
    });
  });

  describe("With instructions", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <SidebarBar
            menuOptions={menuOptions(true)}
            toggleOption={toggleOption}
            instructions
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
});
