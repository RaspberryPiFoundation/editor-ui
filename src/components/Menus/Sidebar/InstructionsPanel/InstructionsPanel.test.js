import { render, screen } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

window.HTMLElement.prototype.scrollTo = jest.fn();
window.Prism = {
  highlightElement: jest.fn(),
};

describe("It renders project steps when there is no quiz", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      instructions: {
        project: {
          steps: [
            { content: "<p>step 0</p>" },
            {
              content:
                "<p>step 1</p><code class='language-python'>print('hello')</code>",
            },
          ],
        },
        quiz: {},
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

  test("Applies syntax highlighting", () => {
    const codeElement = document.getElementsByClassName("language-python")[0];
    expect(window.Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });
});

describe("It renders a quiz when it has one", () => {
  const quizHandler = jest.fn();

  beforeAll(() => {
    document.addEventListener("editor-quizReady", quizHandler);
  });
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      instructions: {
        project: {
          steps: [
            { content: "<p>step 0</p>" },
            { content: "<p>step 1</p>", knowledgeQuiz: "quizPath" },
          ],
        },
        quiz: {
          questions: [
            "<h2>Test quiz</h2><p>step 1</p><code class='language-python'>print('hello')</code>",
          ],
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

  test("Retains the progress bar", () => {
    expect(screen.queryByRole("progressbar")).toBeInTheDocument();
  });

  test("Applies syntax highlighting", () => {
    const codeElement = document.getElementsByClassName("language-python")[0];
    expect(window.Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });

  test("Fires a quizIsReady event", () => {
    expect(quizHandler).toHaveBeenCalled();
  });
});
