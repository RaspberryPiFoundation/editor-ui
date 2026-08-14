import { screen, fireEvent, waitFor } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { setInstructionsEditable } from "../../../../redux/EditorSlice";
import { setCurrentStepPosition } from "../../../../redux/InstructionsSlice";
import { act } from "react";
import Modal from "react-modal";
import { scratchblocksInit } from "../../../../utils/scratchblocks";
import { renderWithProviders } from "../../../../utils/renderWithProviders";
import demoInstructions from "../../../../assets/markdown/demoInstructions.md?raw";
import populateMarkdownTemplate from "../../../../utils/populateMarkdownTemplate";

window.HTMLElement.prototype.scrollTo = vi.fn();

vi.mock("../../../../utils/scratchblocks", () => ({
  scratchblocksInit: vi.fn(),
}));

// Stand-in for the real (jsdom-unfriendly) scratchblocks SVG rendering: swap
// each .language-blocks element for an svg so we can assert it was processed.
// Set as the implementation per-test because Vitest's `mockReset: true` clears it.
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

const openRemoveModal = () =>
  act(() => {
    fireEvent.click(screen.getByTitle("instructionsPanel.removeStep"));
  });

const removeModalScopeRadio = (scope) =>
  screen.getByLabelText(`instructionsPanel.removeStepModal.scope.${scope}`);

const selectRemoveModalScope = (scope) =>
  act(() => {
    fireEvent.click(removeModalScopeRadio(scope));
  });

describe("When instructionsEditable changes from false to true", () => {
  test("does not leave the rendered preview above the edit/view tabs", () => {
    const { container, store } = renderWithProviders(<InstructionsPanel />, {
      preloadedState: {
        editor: {
          project: { instructions: "# Title" },
          instructionsEditable: false,
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
            project: {
              instructions: [{ markdown_content: "instructions" }],
            },
            instructionsEditable: true,
          },
          instructions: {
            permitOverride: true,
            currentStepPosition: 0,
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
        expect(store.getState().editor.project.instructions).toEqual([
          { markdown_content: testString },
        ]);
      });
    });

    test("Does not render the add instructions button", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.addInstructions"),
      ).not.toBeInTheDocument();
    });

    test("Renders a link to the how to write instructions guide", () => {
      const link = screen.getByRole("link", {
        name: "instructionsPanel.guideLink",
      });

      expect(link).toHaveAttribute(
        "href",
        "https://help.editor.raspberrypi.org/hc/en-us/articles/52495086715028-How-to-write-project-instructions",
      );
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Adding and removing steps", () => {
    let store;

    beforeEach(() => {
      ({ store } = renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            project: {
              instructions: [
                { markdown_content: "first" },
                { markdown_content: "second" },
              ],
            },
            instructionsEditable: true,
          },
          instructions: {
            permitOverride: true,
            quiz: {},
            currentStepPosition: 0,
          },
        },
      }));
    });

    test("Renders the add step and remove step buttons", () => {
      expect(screen.getByText("instructionsPanel.addStep")).toBeInTheDocument();
      expect(
        screen.getByTitle("instructionsPanel.removeStep"),
      ).toBeInTheDocument();
    });

    test("Clicking add step inserts a new step after the current step, with default content, and navigates to it", () => {
      const addStepButton = screen.getByText("instructionsPanel.addStep");

      act(() => {
        fireEvent.click(addStepButton);
      });

      expect(store.getState().editor.project.instructions).toEqual([
        { markdown_content: "first" },
        { markdown_content: "instructionsPanel.newStepDefaultContent" },
        { markdown_content: "second" },
      ]);
      expect(store.getState().instructions.currentStepPosition).toBe(1);
    });

    test("Clicking remove step opens a confirmation modal without removing the step", () => {
      const removeStepButton = screen.getByTitle(
        "instructionsPanel.removeStep",
      );

      act(() => {
        fireEvent.click(removeStepButton);
      });

      expect(
        screen.getByText("instructionsPanel.removeStepModal.heading"),
      ).toBeInTheDocument();
      expect(store.getState().editor.project.instructions).toEqual([
        { markdown_content: "first" },
        { markdown_content: "second" },
      ]);
    });

    test("Cancelling the confirmation modal does not remove the step", () => {
      fireEvent.click(screen.getByTitle("instructionsPanel.removeStep"));

      act(() => {
        fireEvent.click(
          screen.getByText("instructionsPanel.removeStepModal.cancel"),
        );
      });

      expect(
        screen.queryByText("instructionsPanel.removeStepModal.heading"),
      ).not.toBeInTheDocument();
      expect(store.getState().editor.project.instructions).toEqual([
        { markdown_content: "first" },
        { markdown_content: "second" },
      ]);
    });

    test("Confirming removal removes the current step and navigates to the previous step", () => {
      act(() => {
        store.dispatch(setCurrentStepPosition(1));
      });

      fireEvent.click(screen.getByTitle("instructionsPanel.removeStep"));

      act(() => {
        fireEvent.click(
          screen.getByText(
            "instructionsPanel.removeStepModal.confirm.currentStep",
          ),
        );
      });

      expect(store.getState().editor.project.instructions).toEqual([
        { markdown_content: "first" },
      ]);
      expect(store.getState().instructions.currentStepPosition).toBe(0);
    });

    test("The confirmation modal offers a scope choice, defaulting to the current step", () => {
      openRemoveModal();

      expect(removeModalScopeRadio("currentStep")).toBeChecked();
      expect(removeModalScopeRadio("allSteps")).not.toBeChecked();
      expect(
        screen.getByText("instructionsPanel.removeStepModal.studentsWarning"),
      ).toBeInTheDocument();
    });

    test("Selecting the remove all steps option relabels the confirm button", () => {
      openRemoveModal();
      selectRemoveModalScope("allSteps");

      expect(removeModalScopeRadio("allSteps")).toBeChecked();
      expect(
        screen.getByText("instructionsPanel.removeStepModal.confirm.allSteps"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "instructionsPanel.removeStepModal.confirm.currentStep",
        ),
      ).not.toBeInTheDocument();
    });

    test("Confirming with the remove all steps option clears the instructions and resets the step position", () => {
      act(() => {
        store.dispatch(setCurrentStepPosition(1));
      });

      openRemoveModal();
      selectRemoveModalScope("allSteps");

      act(() => {
        fireEvent.click(
          screen.getByText(
            "instructionsPanel.removeStepModal.confirm.allSteps",
          ),
        );
      });

      expect(store.getState().editor.project.instructions).toEqual([]);
      expect(store.getState().instructions.currentStepPosition).toBe(0);
      expect(
        screen.getByText("instructionsPanel.emptyState.addInstructions"),
      ).toBeInTheDocument();
    });

    test("Removing the current step is always the default, even after previously choosing to remove all steps", () => {
      openRemoveModal();
      selectRemoveModalScope("allSteps");

      act(() => {
        fireEvent.click(
          screen.getByText("instructionsPanel.removeStepModal.cancel"),
        );
      });

      openRemoveModal();

      expect(removeModalScopeRadio("currentStep")).toBeChecked();
    });
  });

  describe("When there is only one step", () => {
    let store;

    beforeEach(() => {
      ({ store } = renderWithProviders(<InstructionsPanel />, {
        preloadedState: {
          editor: {
            project: {
              instructions: [{ markdown_content: "only step" }],
            },
            instructionsEditable: true,
          },
          instructions: {
            permitOverride: true,
            quiz: {},
            currentStepPosition: 0,
          },
        },
      }));
    });

    test("Renders the step counter and step actions even with a single step", () => {
      expect(
        screen.getByText("instructionsPanel.stepCounter"),
      ).toBeInTheDocument();
      expect(screen.getByText("instructionsPanel.addStep")).toBeInTheDocument();
      expect(
        screen.getByTitle("instructionsPanel.removeStep"),
      ).toBeInTheDocument();
    });

    test("Does not offer the scope choice", () => {
      openRemoveModal();

      expect(
        screen.queryByLabelText(
          "instructionsPanel.removeStepModal.scope.currentStep",
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(
          "instructionsPanel.removeStepModal.removeInstructions",
        ),
      ).toBeInTheDocument();
    });

    test("Confirming removal of the only step falls back to the empty state", () => {
      fireEvent.click(screen.getByTitle("instructionsPanel.removeStep"));

      act(() => {
        fireEvent.click(
          screen.getByText(
            "instructionsPanel.removeStepModal.removeInstructions",
          ),
        );
      });

      expect(store.getState().editor.project.instructions).toEqual([]);
      expect(
        screen.getByText("instructionsPanel.emptyState.addInstructions"),
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
            permitOverride: true,
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

    test("Clicking the add instructions button adds the demo instructions", () => {
      const addInstructionsButton = screen.getByText(
        "instructionsPanel.emptyState.addInstructions",
      );
      act(() => {
        fireEvent.click(addInstructionsButton);
      });

      expect(store.getState().editor.project.instructions).toBe(
        populateMarkdownTemplate(demoInstructions, (str) => str),
      );
    });

    test("Renders the instructions explanation", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.purpose"),
      ).toBeInTheDocument();
    });

    test("Does not render the guide link in the panel header", () => {
      expect(
        screen.queryByRole("link", { name: "instructionsPanel.guideLink" }),
      ).not.toBeInTheDocument();
    });

    test("Adding instructions reveals the guide link", () => {
      act(() => {
        fireEvent.click(
          screen.getByText("instructionsPanel.emptyState.addInstructions"),
        );
      });

      expect(
        screen.getByRole("link", { name: "instructionsPanel.guideLink" }),
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

    test("Does not render the instructions explanation", () => {
      expect(
        screen.queryByText("instructionsPanel.emptyState.purpose"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the how to write instructions guide link", () => {
      expect(
        screen.queryByRole("link", { name: "instructionsPanel.guideLink" }),
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

  it("renders instructions string as a single step", () => {
    renderWithProviders(<InstructionsPanel />, {
      preloadedState: {
        editor: {
          project: { instructions: "# rendered heading" },
          instructionsEditable: false,
        },
      },
    });

    expect(
      screen.getByRole("heading", { name: "rendered heading" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
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

    test("Does not render the how to write instructions guide link", () => {
      expect(
        screen.queryByRole("link", { name: "instructionsPanel.guideLink" }),
      ).not.toBeInTheDocument();
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
