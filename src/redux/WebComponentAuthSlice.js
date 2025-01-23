import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/webComponentAuthReducers";

export const authInitialState = {};

export const WebComponentAuthSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers,
});

export const { setUser, removeUser } = WebComponentAuthSlice.actions;
export default WebComponentAuthSlice.reducer;
