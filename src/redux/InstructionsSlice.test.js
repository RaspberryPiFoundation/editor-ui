import { selectInstructionSteps } from "./InstructionsSlice";

describe("selectInstructionSteps", () => {
  test("Wraps a markdown string project instructions into a single step", () => {
    const state = {
      editor: { project: { instructions: "# Title" } },
      instructions: { permitOverride: true, project: { steps: [] } },
    };

    expect(selectInstructionSteps(state)).toEqual([
      { quiz: false, title: "", markdown_content: "# Title" },
    ]);
  });

  test("Uses an authored steps array from project instructions as-is", () => {
    const steps = [{ quiz: false, title: "Step 1", content: "<p>Go</p>" }];
    const state = {
      editor: { project: { instructions: steps } },
      instructions: { permitOverride: true, project: { steps: [] } },
    };

    expect(selectInstructionSteps(state)).toBe(steps);
  });

  test("Returns an empty array when there are no project instructions", () => {
    const state = {
      editor: { project: { instructions: undefined } },
      instructions: { permitOverride: true, project: { steps: [] } },
    };

    expect(selectInstructionSteps(state)).toEqual([]);
  });

  test("Ignores project instructions when overriding is not permitted", () => {
    const loadedSteps = [
      { quiz: false, title: "Step 1", content: "<p>Loaded</p>" },
    ];
    const state = {
      editor: { project: { instructions: "# Title" } },
      instructions: { permitOverride: false, project: { steps: loadedSteps } },
    };

    expect(selectInstructionSteps(state)).toBe(loadedSteps);
  });

  test("Returns an empty array when overriding is not permitted and nothing has loaded", () => {
    const state = {
      editor: { project: { instructions: "# Title" } },
      instructions: { permitOverride: false, project: {} },
    };

    expect(selectInstructionSteps(state)).toEqual([]);
  });

  test("Returns an empty array when the instructions slice is not present", () => {
    const state = { editor: { project: {} } };

    expect(selectInstructionSteps(state)).toEqual([]);
  });
});
