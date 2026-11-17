import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiCallHandler from "../utils/apiCallHandler";

const API_KEYS = {
  theme: "theme",
  fontSize: "font_size",
  aiFriendlyErrors: "ai_friendly_errors",
};

export const userSettingsInitialState = {
  theme: null, // follow the OS setting
  fontSize: "small",
  aiFriendlyErrors: true,
};

export const toApiSettings = (settings) =>
  Object.fromEntries(
    Object.entries(settings)
      .filter(([key]) => key in API_KEYS)
      .map(([key, value]) => [API_KEYS[key], value]),
  );

export const fromApiSettings = (apiSettings = {}) =>
  Object.fromEntries(
    Object.entries(API_KEYS)
      .filter(([, apiKey]) => apiKey in apiSettings)
      .map(([key, apiKey]) => [key, apiSettings[apiKey]]),
  );

export const loadUserSettings = createAsyncThunk(
  "userSettings/load",
  async ({ reactAppApiEndpoint, accessToken }) => {
    const { getUserSettings } = ApiCallHandler({ reactAppApiEndpoint });
    const { data } = await getUserSettings(accessToken);
    return fromApiSettings(data.settings);
  },
);

export const saveUserSettings = createAsyncThunk(
  "userSettings/save",
  async ({ settings, reactAppApiEndpoint, accessToken }) => {
    if (!accessToken) return;

    const { updateUserSettings } = ApiCallHandler({ reactAppApiEndpoint });
    await updateUserSettings(toApiSettings(settings), accessToken);
  },
);

const UserSettingsSlice = createSlice({
  name: "userSettings",
  initialState: userSettingsInitialState,
  reducers: {
    setUserSettings: (state, action) => ({ ...state, ...action.payload }),
  },
  extraReducers: (builder) => {
    builder.addCase(loadUserSettings.fulfilled, (state, action) => ({
      ...state,
      ...action.payload,
    }));
    builder.addCase(saveUserSettings.pending, (state, action) => ({
      ...state,
      ...action.meta.arg.settings,
    }));
  },
});

export const { setUserSettings } = UserSettingsSlice.actions;
export default UserSettingsSlice.reducer;
