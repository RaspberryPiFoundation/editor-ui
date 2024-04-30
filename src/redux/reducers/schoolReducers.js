import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSchool, getUserSchool } from "../../utils/apiCallHandler";

export const loadSchool = createAsyncThunk(
  `school/load`,
  async ({ id, accessToken }) => {
    if (id) {
      return await getSchool(id, accessToken);
    } else {
      return await getUserSchool(accessToken);
    }
  },
);

export const extraReducers = (builder) => {
  builder.addCase("school/load/pending", (state, action) => {
    return { ...state, loading: true };
  });
  builder.addCase("school/load/fulfilled", (state, action) => {
    return { ...state, ...action.payload, loading: false };
  });
  builder.addCase("school/load/rejected", (state, action) => {
    return { ...state, error: action.error, loading: false };
  });
};
