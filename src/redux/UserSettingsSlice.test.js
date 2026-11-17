import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fromApiSettings,
  loadUserSettings,
  saveUserSettings,
  setUserSettings,
  toApiSettings,
  userSettingsInitialState,
} from "./UserSettingsSlice";
import ApiCallHandler from "../utils/apiCallHandler";

vi.mock("../utils/apiCallHandler");

const getUserSettings = vi.fn();
const updateUserSettings = vi.fn();
const apiDefaults = {
  theme: null,
  font_size: "small",
  ai_friendly_errors: true,
};

const createStore = () => configureStore({ reducer });

beforeEach(() => {
  vi.clearAllMocks();
  ApiCallHandler.mockImplementation(() => ({
    getUserSettings,
    updateUserSettings,
  }));
});

describe("mapping helpers", () => {
  test("toApiSettings converts keys to snake_case and drops unknown keys", () => {
    expect(
      toApiSettings({ fontSize: "large", aiFriendlyErrors: false, foo: 1 }),
    ).toEqual({ font_size: "large", ai_friendly_errors: false });
  });

  test("fromApiSettings converts keys to camelCase and drops unknown keys", () => {
    expect(fromApiSettings({ ...apiDefaults, removed_setting: 1 })).toEqual({
      theme: null,
      fontSize: "small",
      aiFriendlyErrors: true,
    });
  });
});

describe("reducers", () => {
  test("has the expected initial state", () => {
    expect(reducer(undefined, { type: "init" })).toEqual(
      userSettingsInitialState,
    );
  });

  test("setUserSettings merges values into state", () => {
    expect(
      reducer(userSettingsInitialState, setUserSettings({ theme: "dark" })),
    ).toEqual({ ...userSettingsInitialState, theme: "dark" });
  });
});

describe("loadUserSettings", () => {
  const args = { reactAppApiEndpoint: "http://api", accessToken: "token" };

  test("applies settings from the API", async () => {
    getUserSettings.mockResolvedValue({
      data: { settings: { ...apiDefaults, theme: "dark" } },
    });
    const store = createStore();

    await store.dispatch(loadUserSettings(args));

    expect(getUserSettings).toHaveBeenCalledWith("token");
    expect(store.getState().theme).toBe("dark");
  });

  test("ignores a result that is not from the latest load", async () => {
    let resolveFirstLoad;
    getUserSettings
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirstLoad = resolve)),
      )
      .mockResolvedValueOnce({
        data: { settings: { ...apiDefaults, theme: "light" } },
      });
    const store = createStore();

    const firstLoad = store.dispatch(loadUserSettings(args));
    await store.dispatch(loadUserSettings(args));
    resolveFirstLoad({ data: { settings: { ...apiDefaults, theme: "dark" } } });
    await firstLoad;

    expect(store.getState().theme).toBe("light");
  });

  test("keeps settings changed while loading", async () => {
    let resolveLoad;
    getUserSettings.mockImplementationOnce(
      () => new Promise((resolve) => (resolveLoad = resolve)),
    );
    const store = createStore();

    const load = store.dispatch(loadUserSettings(args));
    await store.dispatch(saveUserSettings({ settings: { fontSize: "large" } }));
    resolveLoad({
      data: { settings: { ...apiDefaults, theme: "dark", font_size: "small" } },
    });
    await load;

    expect(store.getState().fontSize).toBe("large");
    expect(store.getState().theme).toBe("dark");
  });

  test("keeps the current state if the API fails", async () => {
    getUserSettings.mockRejectedValue(new Error("Network error"));
    const store = createStore();
    store.dispatch(setUserSettings({ theme: "dark" }));

    await store.dispatch(loadUserSettings(args));

    expect(store.getState().theme).toBe("dark");
  });
});

describe("saveUserSettings", () => {
  test("updates state and saves to the API when logged in", async () => {
    updateUserSettings.mockResolvedValue({ data: {} });
    const store = createStore();

    await store.dispatch(
      saveUserSettings({
        settings: { aiFriendlyErrors: false },
        reactAppApiEndpoint: "http://api",
        accessToken: "token",
      }),
    );

    expect(store.getState().aiFriendlyErrors).toBe(false);
    expect(updateUserSettings).toHaveBeenCalledWith(
      { ai_friendly_errors: false },
      "token",
    );
  });

  test("updates state without calling the API when logged out", async () => {
    const store = createStore();

    await store.dispatch(
      saveUserSettings({ settings: { fontSize: "medium" } }),
    );

    expect(store.getState().fontSize).toBe("medium");
    expect(updateUserSettings).not.toHaveBeenCalled();
  });

  test("rolls back to the previous value if the API fails", async () => {
    updateUserSettings.mockRejectedValue(new Error("Network error"));
    const store = createStore();

    await store.dispatch(
      saveUserSettings({
        settings: { theme: "dark" },
        previousSettings: { theme: null },
        accessToken: "token",
      }),
    );

    expect(store.getState().theme).toBeNull();
  });

  test("does not roll back if the setting has changed again since", async () => {
    let rejectFirstSave;
    updateUserSettings
      .mockImplementationOnce(
        () => new Promise((_, reject) => (rejectFirstSave = reject)),
      )
      .mockResolvedValueOnce({ data: {} });
    const store = createStore();

    const firstSave = store.dispatch(
      saveUserSettings({
        settings: { fontSize: "large" },
        previousSettings: { fontSize: "small" },
        accessToken: "token",
      }),
    );
    await store.dispatch(
      saveUserSettings({
        settings: { fontSize: "medium" },
        previousSettings: { fontSize: "large" },
        accessToken: "token",
      }),
    );
    rejectFirstSave(new Error("Network error"));
    await firstSave;

    expect(store.getState().fontSize).toBe("medium");
  });
});
