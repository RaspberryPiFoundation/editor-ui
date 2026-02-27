import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";
import ProgressBar from "./ProgressBar";

let store;

const renderProgressBarOnStep = (
  stepNumber,
  numberOfSteps = 3,
  panelRef = null
) => {
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
      <ProgressBar panelRef={panelRef} />
    </Provider>
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
  test("Progress bar renders with correct max and value", () => {
    renderProgressBarOnStep(1);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveValue(1);
    expect(progressBar).toHaveAttribute("max", "2");
  });

  test("Clicking previous step button goes back a step", () => {
    renderProgressBarOnStep(1);

    const previousStepButton = screen.getByTitle(
      "instructionsPanel.previousStep"
    );
    fireEvent.click(previousStepButton);
    expect(store.getActions()).toEqual([setCurrentStepPosition(0)]);
  });

  test("Clicking next step button goes forward a step", () => {
    renderProgressBarOnStep(1);

    const nextStepButton = screen.getByTitle("instructionsPanel.nextStep");
    fireEvent.click(nextStepButton);
    expect(store.getActions()).toEqual([setCurrentStepPosition(2)]);
  });

  test("Clicking previous step button calls scrollTo when panelRef is provided", () => {
    const mockScrollTo = jest.fn();
    const panelRef = { current: { scrollTo: mockScrollTo } };

    renderProgressBarOnStep(1, 3, panelRef);

    const previousStepButton = screen.getByTitle(
      "instructionsPanel.previousStep"
    );
    fireEvent.click(previousStepButton);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  test("Clicking next step button calls scrollTo when panelRef is provided", () => {
    const mockScrollTo = jest.fn();
    const panelRef = { current: { scrollTo: mockScrollTo } };

    renderProgressBarOnStep(1, 3, panelRef);

    const nextStepButton = screen.getAllByTitle(
      "instructionsPanel.nextStep"
    )[0];
    fireEvent.click(nextStepButton);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  test("Does not call scrollTo when panelRef is null", () => {
    const mockScrollTo = jest.fn();

    renderProgressBarOnStep(1, 3, null);

    const nextStepButton = screen.getByTitle("instructionsPanel.nextStep");
    fireEvent.click(nextStepButton);

    // Should not throw and should still dispatch
    expect(store.getActions()).toEqual([setCurrentStepPosition(2)]);
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  test("Does not call scrollTo when panelRef.current is null", () => {
    const mockScrollTo = jest.fn();
    const panelRef = { current: null };

    renderProgressBarOnStep(1, 3, panelRef);

    const nextStepButton = screen.getByTitle("instructionsPanel.nextStep");
    fireEvent.click(nextStepButton);

    // Should not throw and should still dispatch
    expect(store.getActions()).toEqual([setCurrentStepPosition(2)]);
    expect(mockScrollTo).not.toHaveBeenCalled();
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
