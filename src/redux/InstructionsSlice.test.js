import reducer, { setStepNumber, setSteps } from "./InstructionsSlice";

const initialState = {
  stepNumber: null,
  steps: [],
};

test("Sets step number correctly", () => {
  const expectedState = {
    ...initialState,
    stepNumber: 5,
  };
  expect(reducer(initialState, setStepNumber(5))).toEqual(expectedState);
});

test("Sets steps correctly", () => {
  const step = { quiz: false, title: "Step 1", content: "Do something!" };
  const expectedState = {
    ...initialState,
    steps: [step],
  };
  expect(reducer(initialState, setSteps([step]))).toEqual(expectedState);
});
