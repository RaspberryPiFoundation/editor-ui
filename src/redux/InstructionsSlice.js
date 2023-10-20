import { createSlice } from "@reduxjs/toolkit";

export const InstructionsSlice = createSlice({
  name: "instructions",
  initialState: {},
  reducers: {
    setInstructions: (_state, action) => {
      return action.payload;
    },
    setCurrentStepPosition: (state, action) => {
      state.currentStepPosition = action.payload;
    },
  },
});

export const { setCurrentStepPosition, setInstructions } =
  InstructionsSlice.actions;
export default InstructionsSlice.reducer;
