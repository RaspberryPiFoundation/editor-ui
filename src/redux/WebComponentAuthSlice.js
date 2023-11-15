import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/webComponentAuthReducers";

export const WebComponentAuthSlice = createSlice({
  name: "auth",
  initialState: {},
  reducers,
});

export const { setUser, removeUser } = WebComponentAuthSlice.actions;
export default WebComponentAuthSlice.reducer;
