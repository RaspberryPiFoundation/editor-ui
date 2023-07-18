import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

import SettingsPanel from "./SettingsPanel";

describe("Settings panel", () => {
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
          <SettingsPanel t={() => {}} />
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Headings are rendered", () => {
    expect(screen.queryByText("sidebar.settingsMenu.textSize")).toBeInTheDocument();
    expect(screen.queryByText("sidebar.settingsMenu.font")).toBeInTheDocument();
  });
});
