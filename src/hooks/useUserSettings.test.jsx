import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Cookies, CookiesProvider } from "react-cookie";
import rootReducer from "../redux/RootSlice";
import ApiCallHandler from "../utils/apiCallHandler";
import {
  settingsFromCookies,
  useLoadUserSettings,
  useUpdateUserSettings,
} from "./useUserSettings";

vi.mock("../utils/apiCallHandler");

const getUserSettings = vi.fn();
const updateUserSettings = vi.fn();
const apiDefaults = {
  theme: null,
  font_size: "small",
  ai_friendly_errors: true,
};
const user = { access_token: "token", profile: { user: "user-id" } };

let store;
let cookies;

const wrapper = ({ children }) => (
  <CookiesProvider cookies={cookies}>
    <Provider store={store}>{children}</Provider>
  </CookiesProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  ApiCallHandler.mockImplementation(() => ({
    getUserSettings,
    updateUserSettings,
  }));
  store = configureStore({ reducer: rootReducer });
  cookies = new Cookies();
  cookies.remove("theme", { path: "/" });
  cookies.remove("fontSize", { path: "/" });
});

describe("settingsFromCookies", () => {
  test("only returns valid values", () => {
    expect(settingsFromCookies({ theme: "dark", fontSize: "huge" })).toEqual({
      theme: "dark",
    });
  });

  test("skips theme when includeTheme is false", () => {
    expect(
      settingsFromCookies(
        { theme: "dark", fontSize: "large" },
        { includeTheme: false },
      ),
    ).toEqual({ fontSize: "large" });
  });
});

describe("useLoadUserSettings", () => {
  test("seeds state from cookies", () => {
    cookies.set("fontSize", "large", { path: "/" });

    renderHook(
      () => useLoadUserSettings({ reactAppApiEndpoint: "http://api" }),
      {
        wrapper,
      },
    );

    expect(store.getState().userSettings.fontSize).toBe("large");
    expect(getUserSettings).not.toHaveBeenCalled();
  });

  test("ignores the theme cookie when the host sets a theme", () => {
    cookies.set("theme", "dark", { path: "/" });

    renderHook(
      () =>
        useLoadUserSettings({
          reactAppApiEndpoint: "http://api",
          hostTheme: "light",
        }),
      { wrapper },
    );

    expect(store.getState().userSettings.theme).toBeNull();
  });

  test("loads settings from the API when logged in and updates cookies", async () => {
    getUserSettings.mockResolvedValue({
      data: { settings: { ...apiDefaults, font_size: "medium" } },
    });

    renderHook(
      () => useLoadUserSettings({ reactAppApiEndpoint: "http://api", user }),
      { wrapper },
    );

    await waitFor(() =>
      expect(store.getState().userSettings.fontSize).toBe("medium"),
    );
    expect(cookies.get("fontSize")).toBe("medium");
  });

  test("uses API defaults over cookies when the user has nothing saved", async () => {
    cookies.set("theme", "dark", { path: "/" });
    getUserSettings.mockResolvedValue({ data: { settings: apiDefaults } });

    renderHook(
      () => useLoadUserSettings({ reactAppApiEndpoint: "http://api", user }),
      { wrapper },
    );

    await waitFor(() => expect(cookies.get("theme")).toBeUndefined());
    expect(store.getState().userSettings.theme).toBeNull();
    expect(updateUserSettings).not.toHaveBeenCalled();
  });
});

describe("useUpdateUserSettings", () => {
  test("updates state and cookies", async () => {
    const { result } = renderHook(() => useUpdateUserSettings(), { wrapper });

    await act(() => result.current({ fontSize: "large" }));

    expect(store.getState().userSettings.fontSize).toBe("large");
    expect(cookies.get("fontSize")).toBe("large");
    expect(updateUserSettings).not.toHaveBeenCalled();
  });

  test("removes the theme cookie when theme is reset", async () => {
    cookies.set("theme", "dark", { path: "/" });
    const { result } = renderHook(() => useUpdateUserSettings(), { wrapper });

    await act(() => result.current({ theme: null }));

    expect(cookies.get("theme")).toBeUndefined();
  });
});
