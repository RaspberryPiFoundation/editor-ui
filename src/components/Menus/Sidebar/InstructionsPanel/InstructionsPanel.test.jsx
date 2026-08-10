import { screen, fireEvent, waitFor } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { setInstructionsEditable } from "../../../../redux/EditorSlice";
import { setCurrentStepPosition } from "../../../../redux/InstructionsSlice";
import { act } from "react";
import Modal from "react-modal";
import Prism from "prismjs";
import { scratchblocksInit } from "../../../../utils/scratchblocks";
import { renderWithProviders } from "../../../../utils/renderWithProviders";

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

describe("When instructionsEditable changes from false to true", () => {
  test("does not leave the rendered preview above the edit/view tabs", () => {
    const { container, store } = renderWithProviders(<InstructionsPanel />, {
      preloadedState: {
        editor: {
          project: { instructions: "# Title" },
          instructionsEditable: false,
        },
        instructions: {
          project: { steps: [{ content: "<h1>Rendered preview</h1>" }] },
          currentStepPosition: 0,
        },
      },
    });

    act(() => {
      store.dispatch(setInstructionsEditable(true));
    });

    const tabsWrapper = container.querySelector(".c-instruction-tabs");
    expect(tabsWrapper).toBeInTheDocument();
    expect(tabsWrapper.firstElementChild).toHaveClass("react-tabs");
  });
});

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
      ({ store } = renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            project: {},
            instructionsEditable: true,
          },
          instructions: {
            project: {
              steps: [{ content: "instructions" }],
            },
            currentStepPosition: 1,
          },
        },
      }));
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
        expect(store.getState().editor.project.instructions).toBe(testString);
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
      ({ store } = renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            project: {},
            instructionsEditable: true,
          },
          instructions: {
            project: {
              steps: [],
            },
            currentStepPosition: 1,
          },
        },
      }));
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

      expect(store.getState().editor.project.instructions).toBe(
        "demoInstructions.md",
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
      renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            project: {},
            instructionsEditable: false,
          },
          instructions: {
            project: {
              steps: [],
            },
            currentStepPosition: 1,
          },
        },
      });
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
      renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
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
            currentStepPosition: 1,
          },
        },
      });
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

    test("Applies syntax highlighting to step content", () => {
      const codeElement = document.getElementsByClassName("language-python")[0];
      expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
    });
  });

  describe("When there is only one step", () => {
    beforeEach(() => {
      renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            instructionsEditable: false,
          },
          instructions: {
            project: {
              steps: [{ content: "<p>step 0</p>" }],
            },
            currentStepPosition: 0,
          },
        },
      });
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

    const renderAtStep = (currentStepPosition) =>
      renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            project: { project_type: "code_editor_scratch" },
            instructionsEditable: false,
          },
          instructions: {
            project: { steps: scratchSteps },
            currentStepPosition,
          },
        },
      });

    beforeEach(() => {
      scratchblocksInit.mockImplementation(fakeScratchblocksInit);
    });

    test("Renders the scratch block as an svg", () => {
      renderAtStep(0);
      expect(screen.getByTestId("scratchblock")).toBeInTheDocument();
    });

    test("Re-renders scratch blocks when navigating to another step", () => {
      const { store } = renderAtStep(0);
      scratchblocksInit.mockClear();

      act(() => {
        store.dispatch(setCurrentStepPosition(1));
      });

      expect(scratchblocksInit).toHaveBeenCalled();
      expect(screen.getByTestId("scratchblock")).toBeInTheDocument();
    });
  });

  describe("When the project is not a scratch project", () => {
    beforeEach(() => {
      scratchblocksInit.mockClear();
      renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
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
            currentStepPosition: 0,
          },
        },
      });
    });

    test("Does not initialise scratchblocks", () => {
      expect(scratchblocksInit).not.toHaveBeenCalled();
    });
  });
});
