import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/instructionsReducers";

export const InstructionsSlice = createSlice({
  name: "instructions",
  initialState: {
    currentStepPosition: 0,
    currentQuestion: 0,
    project: {},
  },
  reducers,
});

export const { setCurrentStepPosition, setInstructions } =
  InstructionsSlice.actions;
export default InstructionsSlice.reducer;
