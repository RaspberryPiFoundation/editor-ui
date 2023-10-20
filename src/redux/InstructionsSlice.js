import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/instructionsReducers";

export const InstructionsSlice = createSlice({
  name: "instructions",
  initialState: {},
  reducers,
});

export const { setCurrentStepPosition, setInstructions } =
  InstructionsSlice.actions;
export default InstructionsSlice.reducer;
