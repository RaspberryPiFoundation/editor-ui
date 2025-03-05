import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ProgressBar from "./ProgressBar";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";

let store;

const renderProgressBarOnStep = (stepNumber, numberOfSteps = 3) => {
  const mockStore = configureStore([]);
  const steps = new Array(numberOfSteps).fill(0).map((i) => ({
    content: `<p>step ${i + 1}</p>`,
  }));

  const initialState = {
    instructions: {
      project: {
        steps,
      },
      currentStepPosition: stepNumber,
    },
  };
  store = mockStore(initialState);
  render(
    <Provider store={store}>
      <ProgressBar />
    </Provider>,
  );
};

describe("When on first step", () => {
  beforeEach(() => {
    renderProgressBarOnStep(0);
  });

  test("Previous step button is disabled", () => {
    expect(screen.getByTitle("instructionsPanel.previousStep")).toBeDisabled();
  });
});

describe("When on a middle step", () => {
  beforeEach(() => {
    renderProgressBarOnStep(1);
  });

  test("Progress bar renders with correct max and value", () => {
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveValue(1);
    expect(progressBar).toHaveAttribute("max", "2");
  });

  test("Clicking previous step button goes back a step", () => {
    const previousStepButton = screen.getByTitle(
      "instructionsPanel.previousStep",
    );
    fireEvent.click(previousStepButton);
    expect(store.getActions()).toEqual([setCurrentStepPosition(0)]);
  });

  test("Clicking next step button goes forward a step", () => {
    const nextStepButton = screen.getByTitle("instructionsPanel.nextStep");
    fireEvent.click(nextStepButton);
    expect(store.getActions()).toEqual([setCurrentStepPosition(2)]);
  });
});

describe("When on last step", () => {
  beforeEach(() => {
    renderProgressBarOnStep(2);
  });

  test("Next step button is disabled", () => {
    expect(screen.getByTitle("instructionsPanel.nextStep")).toBeDisabled();
  });
});
