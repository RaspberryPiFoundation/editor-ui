export const setInstructions = (_state, action) => {
  return action.payload;
};

export const setCurrentStepPosition = (state, action) => {
  state.currentStepPosition = action.payload;
};

export const reducers = { setInstructions, setCurrentStepPosition };
