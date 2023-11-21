import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import SettingsPanel from "./SettingsPanel";

describe("Settings panel", () => {
  describe("When editor is themeable", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          isThemeable: true,
        },
      };
      const store = mockStore(initialState);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <SettingsPanel />
          </MemoryRouter>
        </Provider>,
      );
    });

    test("Renders the font size selector", () => {
      expect(
        screen.queryByText("sidebar.settingsMenu.textSize"),
      ).toBeInTheDocument();
    });

    test("Renders the theme toggle", () => {
      expect(
        screen.queryByText("sidebar.settingsMenu.theme"),
      ).toBeInTheDocument();
    });
  });

  describe("When editor is not themeable", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          isThemeable: false,
        },
      };
      const store = mockStore(initialState);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <SettingsPanel />
          </MemoryRouter>
        </Provider>,
      );
    });

    test("Does not render the theme toggle", () => {
      expect(
        screen.queryByText("sidebar.settingsMenu.theme"),
      ).not.toBeInTheDocument();
    });
  });
});
