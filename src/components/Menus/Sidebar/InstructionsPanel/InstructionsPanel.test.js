import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
import { act } from "react";
import Modal from "react-modal";

window.HTMLElement.prototype.scrollTo = jest.fn();
window.Prism = {
  highlightElement: jest.fn(),
};

describe("When instructionsEditable is true", () => {
  describe("When there are instructions", () => {
    let store;

    beforeAll(() => {
      const root = global.document.createElement("div");
      root.setAttribute("id", "app");
      global.document.body.appendChild(root);
      Modal.setAppElement("#app");
    });

    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {},
          instructionsEditable: true,
        },
        instructions: {
          project: {
            steps: [{ content: "instructions" }],
          },
          quiz: {},
          currentStepPosition: 1,
        },
      };
      store = mockStore(initialState);
      render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    });

    test("Renders two tab titles", () => {
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    test("Renders two tab panels", () => {
      expect(screen.getAllByRole("tabpanel")).toHaveLength(2);
    });

    test("Renders the edit panel", () => {
      expect(screen.getByTestId("instructionTextarea")).toBeInTheDocument();
    });

    test("saves content", async () => {
      const textarea = screen.getByTestId("instructionTextarea");
      const testString = "SomeInstructions";

      fireEvent.change(textarea, { target: { value: testString } });

      await waitFor(() => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([setProjectInstructions(testString)]),
        );
      });
    });

    test("Does not render the add instructions button", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.addInstructions"),
      ).not.toBeInTheDocument();
    });

    test("Renders the remove instructions button", () => {
      expect(
        screen.queryByText("instructionsPanel.removeInstructions"),
      ).toBeInTheDocument();
    });

    test("Remove instructions modal is opened", () => {
      const button = screen.queryByText(
        "instructionsPanel.removeInstructions",
      );
      fireEvent.click(button);

      expect(
        screen.queryByText("instructionsPanel.removeInstructionsModal.heading"),
      ).toBeInTheDocument();
    });
  });

  describe("When there are no instructions", () => {
    let store;

    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {},
          instructionsEditable: true,
        },
        instructions: {
          project: {
            steps: [],
          },
          quiz: {},
          currentStepPosition: 1,
        },
      };
      store = mockStore(initialState);
      render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    });

    test("Renders the add instrucitons button", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.addInstructions"),
      ).toBeInTheDocument();
    });

    test("Does not render the remove instructions button", () => {
      expect(
        screen.queryByText("instructionsPanel.removeInstructions"),
      ).not.toBeInTheDocument();
    });

    test("Clicking the add instructions button adds the demo instructions", () => {
      const addInstructionsButton = screen.getByText(
        "instructionsPanel.emptyState.addInstructions",
      );
      act(() => {
        fireEvent.click(addInstructionsButton);
      });

      expect(store.getActions()).toEqual(
        expect.arrayContaining([setProjectInstructions("demoInstructions.md")]),
      );
    });

    test("Renders the instructions explanation", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.purpose"),
      ).toBeInTheDocument();
    });
  });
});

describe("When instructions are not editable", () => {
  describe("When there are no instructions", () => {
    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {},
          instructionsEditable: false,
        },
        instructions: {
          project: {
            steps: [],
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

    test("Does not render the add instructions button", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.addInstructions"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the remove instructions button", () => {
      expect(
        screen.queryByText("instructionsPanel.removeInstructions"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the instructions explanation", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.purpose"),
      ).not.toBeInTheDocument();
    });

    test("It renders without crashing", () => {
      expect(
        screen.queryByText("instructionsPanel.projectSteps"),
      ).toBeInTheDocument();
    });

    test("Does not render the progress bar", () => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("When there are instructions", () => {
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

    test("Renders no tab titles", () => {
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
    });

    test("Renders no tab panels", () => {
      expect(screen.queryAllByRole("tabpanel")).toHaveLength(0);
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

  describe("When there is only one step", () => {
    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          instructionsEditable: false,
        },
        instructions: {
          project: {
            steps: [{ content: "<p>step 0</p>" }],
          },
          quiz: {},
          currentStepPosition: 0,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    });

    test("Does not render the progress bar", () => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("When there is a quiz", () => {
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
});
