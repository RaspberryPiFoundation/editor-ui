export const setInstructions = (state, action) => {
  if (state.permitOverride) {
    return { ...state, ...action.payload };
  }
  return state;
};

export const setCurrentStepPosition = (state, action) => {
  state.currentStepPosition = action.payload;
};

export const reducers = {
  setInstructions,
  setCurrentStepPosition,
};
