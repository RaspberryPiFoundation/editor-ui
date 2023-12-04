import { render, screen } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

window.HTMLElement.prototype.scrollTo = jest.fn();

describe("It renders project steps when there is no quiz", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      instructions: {
        project: {
          steps: [{ content: "<p>step 0</p>" }, { content: "<p>step 1</p>" }],
        },
        quiz: {},
        currentStepPosition: 1,
        currentQuestion: 0,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <InstructionsPanel />
      </Provider>,
    );
  });

  test("Renders with correct instruction step content", () => {
    expect(screen.queryByText("step 1")).toBeInTheDocument();
  });

  test("Scrolls instructions to the top", () => {
    expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      top: 0,
    });
  });

  test("Renders the progress bar", () => {
    expect(screen.queryByRole("progressbar")).toBeInTheDocument();
  });
});

describe("It can render a quiz", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      instructions: {
        project: {
          steps: [{ content: "<p>step 0</p>" }, { content: "<p>step 1</p>" }],
        },
        quiz: {
          questions: ["<h2>Test quiz</h2>"],
          questionCount: 1,
          currentQuestion: 0,
        },
        currentStepPosition: 1,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <InstructionsPanel />
      </Provider>,
    );
  });

  test("Renders the quiz content", () => {
    expect(screen.queryByText("Test quiz")).toBeInTheDocument();
  });

  test("Scrolls instructions to the top", () => {
    expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      top: 0,
    });
  });

  test("Removes the progress bar", () => {
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
