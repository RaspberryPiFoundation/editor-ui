import { createSlice } from "@reduxjs/toolkit";

export const WebComponentSlice = createSlice({
  name: "component",
  initialState: {
    project: {},
  },

  reducers: {
    setProject: (state, action) => {
      state.project = action.payload;
    },
  },
});

export const { setProject } = WebComponentSlice.actions;

export default WebComponentSlice.reducer;
