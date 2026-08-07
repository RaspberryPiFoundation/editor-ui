import {
  appendStepToInstructions,
  replaceStepMarkdown,
  splitInstructionsIntoSteps,
  withoutPageBreaks,
} from "./instructionSteps";

describe("splitInstructionsIntoSteps", () => {
  test("Returns one section per page break, without the separating blank lines", () => {
    expect(
      splitInstructionsIntoSteps(
        'One\n\n<br class="page-break" />\n\nTwo\n\n<br class="page-break" />\n\nThree',
      ),
    ).toEqual(["One", "Two", "Three"]);
  });

  test("Keeps blank sections", () => {
    expect(splitInstructionsIntoSteps('One<br class="page-break" />')).toEqual([
      "One",
      "",
    ]);
  });

  test("Keeps whitespace the author added beyond the separator", () => {
    expect(
      splitInstructionsIntoSteps('One\n\n<br class="page-break" />\n\n\nTwo'),
    ).toEqual(["One", "\nTwo"]);
  });

  test("Returns a single section when there are no page breaks", () => {
    expect(splitInstructionsIntoSteps("One")).toEqual(["One"]);
  });

  test("Returns no sections when there are no instructions", () => {
    expect(splitInstructionsIntoSteps(null)).toEqual([]);
    expect(splitInstructionsIntoSteps(undefined)).toEqual([]);
  });
});

describe("replaceStepMarkdown", () => {
  const instructions =
    'One\n\n<br class="page-break" />\n\nTwo\n\n<br class="page-break" />\n\nThree';

  test("Replaces only the given step", () => {
    expect(replaceStepMarkdown(instructions, 1, "Rewritten")).toEqual(
      'One\n\n<br class="page-break" />\n\nRewritten\n\n<br class="page-break" />\n\nThree',
    );
  });

  test("Drops page break markers typed by the author", () => {
    expect(
      replaceStepMarkdown(instructions, 0, 'A<br class="page-break" />B'),
    ).toEqual(
      'AB\n\n<br class="page-break" />\n\nTwo\n\n<br class="page-break" />\n\nThree',
    );
  });

  test("Leaves the document alone for an out of range step", () => {
    expect(replaceStepMarkdown(instructions, 9, "Rewritten")).toEqual(
      instructions,
    );
  });

  test("Writing a step back unchanged is a no-op", () => {
    const steps = splitInstructionsIntoSteps(instructions);

    steps.forEach((step, index) => {
      expect(replaceStepMarkdown(instructions, index, step)).toEqual(
        instructions,
      );
    });
  });

  test("Does not accumulate whitespace as a step is edited repeatedly", () => {
    let document = instructions;

    for (let edit = 0; edit < 3; edit++) {
      const step = splitInstructionsIntoSteps(document)[1];
      document = replaceStepMarkdown(document, 1, `${step}!`);
    }

    expect(document).toEqual(
      'One\n\n<br class="page-break" />\n\nTwo!!!\n\n<br class="page-break" />\n\nThree',
    );
  });
});

describe("appendStepToInstructions", () => {
  test("Adds a blank step at the end", () => {
    const instructions = appendStepToInstructions("One");

    expect(instructions).toEqual('One\n\n<br class="page-break" />\n\n');
    expect(splitInstructionsIntoSteps(instructions)).toEqual(["One", ""]);
  });
});

describe("withoutPageBreaks", () => {
  test("Removes every page break marker", () => {
    expect(
      withoutPageBreaks(
        `One<br class="page-break" />Two<br class='page-break'>Three`,
      ),
    ).toEqual("OneTwoThree");
  });

  test("Leaves other markup alone", () => {
    expect(withoutPageBreaks("One<br />Two")).toEqual("One<br />Two");
  });
});
