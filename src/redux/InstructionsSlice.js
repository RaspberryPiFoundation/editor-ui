import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/instructionsReducers";

export const instructionsInitialState = {
  currentStepPosition: 0,
  project: {},
  permitOverride: true,
};

export const InstructionsSlice = createSlice({
  name: "instructions",
  initialState: instructionsInitialState,
  reducers,
});

export const { setCurrentStepPosition, setInstructions } =
  InstructionsSlice.actions;
export default InstructionsSlice.reducer;
