import { createSlice } from "@reduxjs/toolkit";

export const InstructionsSlice = createSlice({
  name: "instructions",
  initialState: {
    steps: [],
    stepNumber: null,
  },
  reducers: {
    setStepNumber: (state, action) => {
      state.stepNumber = action.payload;
    },

    setSteps: (state, action) => {
      state.steps = action.payload;
    },
  },
});

export const { setStepNumber, setSteps } = InstructionsSlice.actions;
export default InstructionsSlice.reducer;
