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

test("Sets instructions including step position correctly when permitOverride is true", () => {
  let state = { currentStepPosition: 0, permitOverride: true };

  const step = { quiz: false, title: "Step 1", content: "Do something!" };
  const instructions = {
    currentStepPosition: 7,
    project: {
      steps: [step],
    },
    permitOverride: true,
  };
  expect(setInstructions(state, { payload: instructions })).toEqual(
    instructions,
  );
});

test("Keeps original step position if no progress", () => {
  let state = { currentStepPosition: 0, permitOverride: true };

  const step = { quiz: false, title: "Step 1", content: "Do something!" };
  const instructions = {
    project: {
      steps: [step],
    },
    permitOverride: true,
  };
  expect(setInstructions(state, { payload: instructions })).toEqual({
    ...instructions,
    currentStepPosition: 0,
  });
});

test("Does not set instructions when permitOverride is false", () => {
  let state = { currentStepPosition: 0, permitOverride: false };

  const step = { quiz: false, title: "Step 1", content: "Do something!" };
  const instructions = {
    currentStepPosition: 7,
    project: {
      steps: [step],
    },
    permitOverride: true,
  };
  expect(setInstructions(state, { payload: instructions })).toEqual(state);
});
