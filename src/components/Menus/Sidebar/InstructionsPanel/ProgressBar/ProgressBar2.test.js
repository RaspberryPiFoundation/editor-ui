import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import ProgressBar from "./ProgressBar";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";

// Create a mock store
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
});

describe("ProgressBar", () => {
  it("renders without crashing", () => {
    render(
      <Provider store={store}>
        <ProgressBar />
      </Provider>,
    );
  });

  it("displays the correct progress", () => {
    const { getByRole } = render(
      <Provider store={store}>
        <ProgressBar />
      </Provider>,
    );

    const progress = getByRole("progressbar");
    expect(progress).toHaveAttribute("max", "2");
    expect(progress).toHaveAttribute("value", "1");
  });

  it("dispatches setCurrentStepPosition with correct value when next button is clicked", () => {
    const { getByTitle } = render(
      <Provider store={store}>
        <ProgressBar />
      </Provider>,
    );

    const nextButton = getByTitle("instructionsPanel.nextStep");
    fireEvent.click(nextButton);

    const actions = store.getActions();
    expect(actions[0]).toEqual(setCurrentStepPosition(2));
  });

  it("dispatches setCurrentStepPosition with correct value when previous button is clicked", () => {
    const { getByTitle } = render(
      <Provider store={store}>
        <ProgressBar />
      </Provider>,
    );

    const previousButton = getByTitle("instructionsPanel.previousStep");
    fireEvent.click(previousButton);

    const actions = store.getActions();
    expect(actions[0]).toEqual(setCurrentStepPosition(0));
  });
});
