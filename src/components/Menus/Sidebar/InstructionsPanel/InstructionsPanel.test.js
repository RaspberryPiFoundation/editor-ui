import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
import { act } from "react";
import Modal from "react-modal";
import Prism from "prismjs";
import { scratchblocksInit } from "../../../../utils/scratchblocks";

window.HTMLElement.prototype.scrollTo = jest.fn();
jest.mock("prismjs", () => ({
  ...jest.requireActual("prismjs"),
  highlightElement: jest.fn(),
}));
jest.mock("../../../../utils/scratchblocks", () => ({
  scratchblocksInit: jest.fn(),
}));

// Stand-in for the real (jsdom-unfriendly) scratchblocks SVG rendering: swap
// each .language-blocks element for an svg so we can assert it was processed.
// Set as the implementation per-test because jest `resetMocks: true` clears it.
const fakeScratchblocksInit = (_locale, container) => {
  container.querySelectorAll(".language-blocks").forEach((block) => {
    const svg = global.document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svg.setAttribute("data-testid", "scratchblock");
    block.parentNode.replaceChild(svg, block);
  });
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
          project: { instructions: "instructions" },
          instructionsEditable: true,
        },
        instructions: {
          project: {
            steps: [{ content: "<p>rendered instructions</p>" }],
          },
          quiz: {},
          currentStepPosition: 0,
        },
      };
      store = mockStore(initialState);
      render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    });

    test("Renders no tab titles", () => {
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
    });

    test("Renders the markdown editor", () => {
      expect(screen.getByTestId("instructionTextarea")).toHaveValue(
        "instructions",
      );
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

    test("Discards page break markers typed by the author", async () => {
      const textarea = screen.getByTestId("instructionTextarea");

      fireEvent.change(textarea, {
        target: { value: 'One<br class="page-break" />two' },
      });

      await waitFor(() => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([setProjectInstructions("Onetwo")]),
        );
      });
    });

    test("Renders the preview button", () => {
      expect(
        screen.queryByText("instructionsPanel.preview"),
      ).toBeInTheDocument();
    });

    test("Clicking preview renders the markdown and offers to edit again", () => {
      fireEvent.click(screen.getByText("instructionsPanel.preview"));

      expect(
        screen.queryByTestId("instructionTextarea"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("rendered instructions")).toBeInTheDocument();
      expect(screen.queryByText("instructionsPanel.edit")).toBeInTheDocument();
    });

    test("Clicking edit returns to the markdown editor", () => {
      fireEvent.click(screen.getByText("instructionsPanel.preview"));
      fireEvent.click(screen.getByText("instructionsPanel.edit"));

      expect(screen.getByTestId("instructionTextarea")).toBeInTheDocument();
      // The preview is written into the DOM by hand, so it has to go with the
      // element it was written into rather than linger behind the editor.
      expect(
        screen.queryByText("rendered instructions"),
      ).not.toBeInTheDocument();
    });

    test("Shows the pagination while editing a single step", () => {
      expect(
        screen.queryByText("instructionsPanel.noSteps"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("instructionsPanel.addStep"),
      ).toBeInTheDocument();
    });

    test("Clicking add step appends a page break to the instructions", async () => {
      fireEvent.click(screen.getByText("instructionsPanel.addStep"));

      await waitFor(() => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            setProjectInstructions(
              'instructions\n\n<br class="page-break" />\n\n',
            ),
          ]),
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
      const button = screen.queryByText("instructionsPanel.removeInstructions");
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

  describe("When the editable instructions contain scratch code blocks", () => {
    // Deliberately not a scratch project, to prove that editable instructions
    // render scratch blocks purely because they are editable.
    const renderEditablePanel = () => {
      const mockStore = configureStore([]);
      const store = mockStore({
        editor: {
          project: { project_type: "python" },
          instructionsEditable: true,
        },
        instructions: {
          project: {
            steps: [
              {
                content:
                  "<pre><code class='language-blocks'>say [hello]</code></pre>",
              },
            ],
          },
          quiz: {},
          currentStepPosition: 0,
        },
      });
      return render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    };

    beforeEach(() => {
      scratchblocksInit.mockImplementation(fakeScratchblocksInit);
    });

    const openPreview = () => {
      // The rendered content is only mounted once the author previews it.
      fireEvent.click(screen.getByText("instructionsPanel.preview"));
    };

    test("Renders the scratch block as an svg in the preview", () => {
      renderEditablePanel();
      openPreview();
      expect(screen.getByTestId("scratchblock")).toBeInTheDocument();
    });

    test("Initialises scratchblocks with the step content container", () => {
      renderEditablePanel();
      openPreview();
      expect(scratchblocksInit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(HTMLElement),
      );
    });
  });

  describe("When the editable instructions have multiple steps", () => {
    const instructions = 'Step one\n\n<br class="page-break" />\n\nStep two';
    let store;

    const renderAtStep = (currentStepPosition) => {
      const mockStore = configureStore([]);
      store = mockStore({
        editor: {
          project: { instructions },
          instructionsEditable: true,
        },
        instructions: {
          project: {
            steps: [{ content: "Step one" }, { content: "Step two" }],
          },
          quiz: {},
          currentStepPosition,
        },
      });
      render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    };

    test("Shows the pagination while editing", () => {
      renderAtStep(0);
      expect(screen.queryByRole("progressbar")).toBeInTheDocument();
    });

    test("Edits only the markdown of the current step", () => {
      renderAtStep(1);
      expect(screen.getByTestId("instructionTextarea")).toHaveValue("Step two");
    });

    test("Writes edits back into the current step", () => {
      renderAtStep(1);

      fireEvent.change(screen.getByTestId("instructionTextarea"), {
        target: { value: "Rewritten" },
      });

      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          setProjectInstructions(
            'Step one\n\n<br class="page-break" />\n\nRewritten',
          ),
        ]),
      );
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
                  <code class='language-javascript'>const element = document.getElementById("my-element")</code>
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
      expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
    });

    test("Applies syntax highlighting to HTML code", () => {
      const codeElement = document.getElementsByClassName("language-html")[0];
      expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
    });

    test("Applies syntax highlighting to CSS code", () => {
      const codeElement = document.getElementsByClassName("language-css")[0];
      expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
    });

    test("Applies syntax highlighting to javascript code", () => {
      const codeElement = document.getElementsByClassName(
        "language-javascript",
      )[0];
      expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
    });
  });

  describe("When window.syntaxHighlight is defined", () => {
    beforeEach(() => {
      window.syntaxHighlight = {
        highlightElement: jest.fn(),
      };
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {},
          instructionsEditable: false,
        },
        instructions: {
          project: {
            steps: [
              {
                content: "<code class='language-python'>print('hello')</code>",
              },
            ],
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

    test("Applies syntax highlighting using window.syntaxHighlight", () => {
      const codeElement = document.getElementsByClassName("language-python")[0];
      expect(window.syntaxHighlight.highlightElement).toHaveBeenCalledWith(
        codeElement,
      );
    });

    afterEach(() => {
      delete window.syntaxHighlight;
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

  describe("When the project is a scratch project", () => {
    const scratchSteps = [
      {
        content: "<pre><code class='language-blocks'>say [hello]</code></pre>",
      },
      {
        content:
          "<pre><code class='language-blocks'>move (10) steps</code></pre>",
      },
    ];

    const renderAtStep = (currentStepPosition) => {
      const mockStore = configureStore([]);
      const store = mockStore({
        editor: {
          project: { project_type: "code_editor_scratch" },
          instructionsEditable: false,
        },
        instructions: {
          project: { steps: scratchSteps },
          quiz: {},
          currentStepPosition,
        },
      });
      return render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    };

    beforeEach(() => {
      scratchblocksInit.mockImplementation(fakeScratchblocksInit);
    });

    test("Renders the scratch block as an svg", () => {
      renderAtStep(0);
      expect(screen.getByTestId("scratchblock")).toBeInTheDocument();
    });

    test("Initialises scratchblocks with the step content container", () => {
      renderAtStep(0);
      expect(scratchblocksInit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(HTMLElement),
      );
    });

    test("Re-renders scratch blocks when navigating to another step", () => {
      const { rerender } = renderAtStep(0);
      scratchblocksInit.mockClear();

      const mockStore = configureStore([]);
      const store = mockStore({
        editor: {
          project: { project_type: "code_editor_scratch" },
          instructionsEditable: false,
        },
        instructions: {
          project: { steps: scratchSteps },
          quiz: {},
          currentStepPosition: 1,
        },
      });
      rerender(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );

      expect(scratchblocksInit).toHaveBeenCalled();
      expect(screen.getByTestId("scratchblock")).toBeInTheDocument();
    });
  });

  describe("When the project is not a scratch project", () => {
    beforeEach(() => {
      scratchblocksInit.mockClear();
      const mockStore = configureStore([]);
      const store = mockStore({
        editor: {
          project: { project_type: "python" },
          instructionsEditable: false,
        },
        instructions: {
          project: {
            steps: [
              {
                content:
                  "<pre><code class='language-blocks'>say [hello]</code></pre>",
              },
            ],
          },
          quiz: {},
          currentStepPosition: 0,
        },
      });
      render(
        <Provider store={store}>
          <InstructionsPanel />
        </Provider>,
      );
    });

    test("Does not initialise scratchblocks", () => {
      expect(scratchblocksInit).not.toHaveBeenCalled();
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
      expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
    });

    test("Fires a quizIsReady event", () => {
      expect(quizHandler).toHaveBeenCalled();
    });
  });
});
