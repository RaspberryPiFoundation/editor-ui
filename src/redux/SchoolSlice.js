import { createSlice } from "@reduxjs/toolkit";
import { reducers, extraReducers } from "./reducers/schoolReducers";

export const SchoolSlice = createSlice({
  name: "school",
  initialState: {},
  reducers,
  extraReducers,
});

// export const {} = SchoolSlice.actions;
export default SchoolSlice.reducer;
