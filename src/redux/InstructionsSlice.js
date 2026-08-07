import { createSelector, createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/instructionsReducers";

export const instructionsInitialState = {
  currentStepPosition: 0,
  project: {},
  permitOverride: true,
};

const InstructionsSlice = createSlice({
  name: "instructions",
  initialState: instructionsInitialState,
  reducers,
});

export const { setCurrentStepPosition, setInstructions } =
  InstructionsSlice.actions;
export default InstructionsSlice.reducer;

export const selectInstructionSteps = createSelector(
  [
    (state) => state.editor.project?.instructions,
    (state) => state.instructions.permitOverride,
    (state) => state.instructions.project?.steps,
  ],
  (projectInstructions, permitOverride, loadedSteps) => {
    if (!permitOverride) {
      return loadedSteps || [];
    }
    if (typeof projectInstructions === "string") {
      return [
        { quiz: false, title: "", markdown_content: projectInstructions },
      ];
    }
    return projectInstructions || [];
  },
);
