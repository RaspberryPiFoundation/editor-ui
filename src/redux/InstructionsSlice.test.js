import reducer, {
  setCurrentStepPosition,
  setInstructions,
} from "./InstructionsSlice";

const initialState = {};

test("Sets step number correctly", () => {
  const expectedState = {
    currentStepPosition: 5,
  };
  expect(reducer(initialState, setCurrentStepPosition(5))).toEqual(
    expectedState,
  );
});

test("Sets instructions correctly", () => {
  const step = { quiz: false, title: "Step 1", content: "Do something!" };
  const instructions = {
    currentStepPosition: 7,
    project: {
      steps: [step],
    },
  };
  expect(reducer(initialState, setInstructions(instructions))).toEqual(
    instructions,
  );
});
