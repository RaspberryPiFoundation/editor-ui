export const setInstructions = (state, action) => {
  return { ...state, ...action.payload };
};

export const setCurrentStepPosition = (state, action) => {
  state.currentStepPosition = action.payload;
};

export const setCurrentQuestion = (state, action) => {
  state.currentQuestion = action.payload;
};

export const reducers = {
  setInstructions,
  setCurrentStepPosition,
  setCurrentQuestion,
};
