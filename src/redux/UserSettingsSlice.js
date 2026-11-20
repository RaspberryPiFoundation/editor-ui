import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiCallHandler from "../utils/apiCallHandler";

const API_KEYS = {
  theme: "theme",
  fontSize: "font_size",
  aiHintsEnabled: "ai_hints_enabled",
};

export const userSettingsInitialState = {
  theme: null, // follow the OS setting
  fontSize: "small",
  aiHintsEnabled: true,
  loadRequestId: null,
  editedDuringLoad: [],
  latestSaveIds: {},
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
    builder.addCase(loadUserSettings.pending, (state, action) => {
      state.loadRequestId = action.meta.requestId;
      state.editedDuringLoad = [];
      state.latestSaveIds = {};
    });
    builder.addCase(loadUserSettings.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.loadRequestId) return;

      Object.entries(action.payload).forEach(([key, value]) => {
        if (!state.editedDuringLoad.includes(key)) state[key] = value;
      });
      state.loadRequestId = null;
      state.editedDuringLoad = [];
    });
    builder.addCase(loadUserSettings.rejected, (state, action) => {
      if (action.meta.requestId !== state.loadRequestId) return;

      state.loadRequestId = null;
      state.editedDuringLoad = [];
    });
    builder.addCase(saveUserSettings.pending, (state, action) => {
      const { settings } = action.meta.arg;
      Object.assign(state, settings);
      Object.keys(settings).forEach((key) => {
        state.latestSaveIds[key] = action.meta.requestId;
      });
      if (state.loadRequestId) {
        state.editedDuringLoad.push(...Object.keys(settings));
      }
    });
    builder.addCase(saveUserSettings.rejected, (state, action) => {
      const { previousSettings = {} } = action.meta.arg;
      Object.entries(previousSettings).forEach(([key, value]) => {
        if (state.latestSaveIds[key] !== action.meta.requestId) return;

        state[key] = value;
        state.editedDuringLoad = state.editedDuringLoad.filter(
          (editedKey) => editedKey !== key,
        );
      });
    });
  },
});

export const { setUserSettings } = UserSettingsSlice.actions;
export default UserSettingsSlice.reducer;
