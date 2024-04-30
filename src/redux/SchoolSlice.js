import { createSlice } from "@reduxjs/toolkit";
import { reducers, extraReducers } from "./reducers/schoolReducers";

export const SchoolSlice = createSlice({
  name: "school",
  initialState: {},
  reducers,
  extraReducers,
});

export default SchoolSlice.reducer;
