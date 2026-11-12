import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import SettingsPanel from "./SettingsPanel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (str) => str, i18n: { language: "en" } }),
}));

describe("Settings panel", () => {
  describe("When editor is themeable", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          project: {},
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
          project: {},
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

describe("AI hint toggle", () => {
  const renderPanel = (editor, user = { access_token: "token" }) => {
    const store = configureStore([])({
      editor: { project: {}, ...editor },
      auth: { user },
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SettingsPanel />
        </MemoryRouter>
      </Provider>,
    );
  };

  const aiHintAvailable = {
    aiErrorsEnabled: true,
    friendlyErrorsEnabled: true,
  };

  test("Renders when AI hints are available", () => {
    renderPanel(aiHintAvailable);
    expect(
      screen.queryByText("sidebar.settingsMenu.aiHint"),
    ).toBeInTheDocument();
  });

  test("Does not render when AI errors are disabled", () => {
    renderPanel({ ...aiHintAvailable, aiErrorsEnabled: false });
    expect(
      screen.queryByText("sidebar.settingsMenu.aiHint"),
    ).not.toBeInTheDocument();
  });

  test("Does not render when the user is not logged in", () => {
    renderPanel(aiHintAvailable, null);
    expect(
      screen.queryByText("sidebar.settingsMenu.aiHint"),
    ).not.toBeInTheDocument();
  });
});
