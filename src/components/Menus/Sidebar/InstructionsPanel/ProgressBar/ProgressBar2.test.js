import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import ProgressBar from "./ProgressBar";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";

const mockStore = configureMockStore();
let store;

beforeEach(() => {
  store = mockStore({
    instructions: {
      project: {
        steps: [{}, {}, {}],
      },
      currentStepPosition: 1,
    },
  });

  render(
    <Provider store={store}>
      <ProgressBar />
    </Provider>,
  );
});

describe("ProgressBar", () => {
  test("renders without crashing", () => {
    // Test will pass if render in beforeEach doesn't throw an error
  });

  test("displays the correct progress", () => {
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("max", "2");
    expect(progress).toHaveAttribute("value", "1");
  });

  test("dispatches setCurrentStepPosition with correct value when next button is clicked", () => {
    const nextButton = screen.getByTitle("instructionsPanel.nextStep");
    fireEvent.click(nextButton);

    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([setCurrentStepPosition(2)]),
    );
  });

  test("dispatches setCurrentStepPosition with correct value when previous button is clicked", () => {
    const previousButton = screen.getByTitle("instructionsPanel.previousStep");
    fireEvent.click(previousButton);

    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([setCurrentStepPosition(0)]),
    );
  });
});
