import {
  insertStepAfter,
  removeStepAt,
  updateStepMarkdown,
} from "./instructionSteps";

describe("insertStepAfter", () => {
  it("inserts a new empty step immediately after the given index", () => {
    const steps = [{ markdown_content: "one" }, { markdown_content: "two" }];

    const result = insertStepAfter(steps, 0);

    expect(result).toEqual([
      { markdown_content: "one" },
      { markdown_content: "" },
      { markdown_content: "two" },
    ]);
  });

  it("appends the new step at the end when index is the last step", () => {
    const steps = [{ markdown_content: "one" }];

    const result = insertStepAfter(steps, 0);

    expect(result).toEqual([
      { markdown_content: "one" },
      { markdown_content: "" },
    ]);
  });
});

describe("removeStepAt", () => {
  it("removes only the step at the given index", () => {
    const steps = [
      { markdown_content: "one" },
      { markdown_content: "two" },
      { markdown_content: "three" },
    ];

    const result = removeStepAt(steps, 1);

    expect(result).toEqual([
      { markdown_content: "one" },
      { markdown_content: "three" },
    ]);
  });

  it("returns an empty array when removing the only step", () => {
    const steps = [{ markdown_content: "one" }];

    const result = removeStepAt(steps, 0);

    expect(result).toEqual([]);
  });
});

describe("updateStepMarkdown", () => {
  it("replaces markdown_content only for the step at the given index", () => {
    const steps = [{ markdown_content: "one" }, { markdown_content: "two" }];

    const result = updateStepMarkdown(steps, 1, "updated");

    expect(result).toEqual([
      { markdown_content: "one" },
      { markdown_content: "updated" },
    ]);
  });

  it("preserves other fields on the updated step", () => {
    const steps = [{ title: "First", markdown_content: "one" }];

    const result = updateStepMarkdown(steps, 0, "updated");

    expect(result).toEqual([{ title: "First", markdown_content: "updated" }]);
  });
});
