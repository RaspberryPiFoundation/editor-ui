export const setInstructions = (state, action) => {
  return { ...state, ...action.payload };
};

export const setCurrentStepPosition = (state, action) => {
  state.currentStepPosition = action.payload;
};

export const reducers = {
  setInstructions,
  setCurrentStepPosition,
};
