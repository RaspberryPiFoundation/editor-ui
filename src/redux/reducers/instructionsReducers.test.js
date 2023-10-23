import {
  setCurrentStepPosition,
  setInstructions,
} from "./instructionsReducers";

test("Sets step number correctly", () => {
  let state = {};
  const expectedState = {
    currentStepPosition: 5,
  };
  setCurrentStepPosition(state, { payload: 5 });
  expect(state).toEqual(expectedState);
});

test("Sets instructions correctly", () => {
  let state = {};

  const step = { quiz: false, title: "Step 1", content: "Do something!" };
  const instructions = {
    currentStepPosition: 7,
    project: {
      steps: [step],
    },
  };
  expect(setInstructions(state, { payload: instructions })).toEqual(
    instructions,
  );
});
