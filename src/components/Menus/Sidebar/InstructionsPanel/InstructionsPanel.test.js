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
      editor: {
        project: {},
        instructionsEditable: false,
      },
      instructions: {
        project: {
          steps: [
            { content: "<p>step 0</p>" },
            {
              content: `<p>step 1</p>
                <code class='language-python'>print('hello')</code>
                <code class='language-html'><p>Hello world</p></code>
                <code class='language-css'>.hello { color: purple }</code>
                `,
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

  test("Applies syntax highlighting to python code", () => {
    const codeElement = document.getElementsByClassName("language-python")[0];
    expect(window.Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });

  test("Applies syntax highlighting to HTML code", () => {
    const codeElement = document.getElementsByClassName("language-html")[0];
    expect(window.Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });

  test("Applies syntax highlighting to CSS code", () => {
    const codeElement = document.getElementsByClassName("language-css")[0];
    expect(window.Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });
});

describe("When instructionsEditable is true", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      editor: {
        project: {},
        instructionsEditable: true,
      },
      instructions: {
        project: {
          steps: [
            { content: "<p>step 0</p>" },
            {
              content: `<p>step 1</p>
                <code class='language-python'>print('hello')</code>
                <code class='language-html'><p>Hello world</p></code>
                <code class='language-css'>.hello { color: purple }</code>
                `,
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

  test("Renders the edit panel", () => {
    // TODO: CR: 2024-01-14: Add edit panel
    expect(screen.queryByText("Edit panel will go here")).toBeInTheDocument();
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
