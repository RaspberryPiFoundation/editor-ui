import React from "react";
import { act, render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Cookies, CookiesProvider } from "react-cookie";
import ThemeToggle from "./ThemeToggle";
import rootReducer from "../../../../../redux/RootSlice";
import { setUserSettings } from "../../../../../redux/UserSettingsSlice";

const themeUpdatedHandler = vi.fn();

const mockMatchMedia = (matches) => {
  window.matchMedia = (query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
};

let store;
let cookies;

const renderToggle = (theme = null) => {
  store = configureStore({ reducer: rootReducer });
  store.dispatch(setUserSettings({ theme }));
  cookies = new Cookies();
  render(
    <CookiesProvider cookies={cookies}>
      <Provider store={store}>
        <ThemeToggle />
      </Provider>
    </CookiesProvider>,
  );
};

beforeAll(() => {
  document.addEventListener("editor-themeUpdated", (e) =>
    themeUpdatedHandler(e.detail),
  );
});

afterEach(() => {
  act(() => {
    cookies.remove("theme", { path: "/" });
  });
});

describe("When the OS prefers light mode and no theme is set", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    renderToggle();
  });

  test("Does not set a cookie on render", () => {
    expect(cookies.get("theme")).toBeUndefined();
  });

  test("Sets the theme to dark when button clicked", () => {
    fireEvent.click(screen.getByText("sidebar.settingsMenu.themeOptions.dark"));
    expect(store.getState().userSettings.theme).toBe("dark");
    expect(cookies.get("theme")).toBe("dark");
  });

  test("Fires theme updated custom event when button clicked", () => {
    fireEvent.click(screen.getByText("sidebar.settingsMenu.themeOptions.dark"));
    expect(themeUpdatedHandler).toHaveBeenCalledWith("dark");
  });
});

describe("When the OS prefers dark mode and no theme is set", () => {
  beforeEach(() => {
    mockMatchMedia(true);
    renderToggle();
  });

  test("Sets the theme to light when button clicked", () => {
    fireEvent.click(
      screen.getByText("sidebar.settingsMenu.themeOptions.light"),
    );
    expect(store.getState().userSettings.theme).toBe("light");
    expect(cookies.get("theme")).toBe("light");
  });

  test("Fires theme updated custom event when button clicked", () => {
    fireEvent.click(
      screen.getByText("sidebar.settingsMenu.themeOptions.light"),
    );
    expect(themeUpdatedHandler).toHaveBeenCalledWith("light");
  });
});

describe("When the theme setting is dark", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    renderToggle("dark");
  });

  test("Changes to light when button clicked", () => {
    fireEvent.click(
      screen.getByText("sidebar.settingsMenu.themeOptions.light"),
    );
    expect(store.getState().userSettings.theme).toBe("light");
  });
});
