import { parseAnswer, withheldFix } from "./formatAnswer";

const text = (spans) => ({ type: "text", spans });

describe("parseAnswer", () => {
  test("returns plain prose as a single text block", () => {
    expect(parseAnswer("Look at line 1.")).toEqual([
      text([{ code: false, text: "Look at line 1." }]),
    ]);
  });

  test("pulls out a fenced block and its language", () => {
    const blocks = parseAnswer(
      'Change it to:\n\n```python\nfoo = "hi"\nprint(foo)\n```\n\nThat fixes it.',
    );

    expect(blocks).toEqual([
      text([{ code: false, text: "Change it to:" }]),
      {
        type: "code",
        language: "python",
        content: 'foo = "hi"\nprint(foo)',
        open: false,
      },
      text([{ code: false, text: "That fixes it." }]),
    ]);
  });

  test("handles a fence with no language", () => {
    const blocks = parseAnswer("```\nprint(1)\n```");
    expect(blocks).toEqual([
      { type: "code", language: "", content: "print(1)", open: false },
    ]);
  });

  test("marks an unclosed fence open, as happens mid-stream", () => {
    // Rendering it the same way means the code does not reflow when the
    // closing fence finally arrives.
    const blocks = parseAnswer("Try:\n\n```python\nfoo = ");
    expect(blocks).toEqual([
      text([{ code: false, text: "Try:" }]),
      { type: "code", language: "python", content: "foo = ", open: true },
    ]);
  });

  test("splits inline code out of prose", () => {
    expect(parseAnswer("The variable `ar` is not `art`.")).toEqual([
      text([
        { code: false, text: "The variable " },
        { code: true, text: "ar" },
        { code: false, text: " is not " },
        { code: true, text: "art" },
        { code: false, text: "." },
      ]),
    ]);
  });

  test("leaves an unclosed backtick as literal text", () => {
    expect(parseAnswer("Look at `ar and see")).toEqual([
      text([{ code: false, text: "Look at `ar and see" }]),
    ]);
  });

  test("splits on blank lines so each paragraph wraps on its own", () => {
    const blocks = parseAnswer("First para.\n\nSecond para.\n\n\nThird.");

    expect(blocks).toEqual([
      text([{ code: false, text: "First para." }]),
      text([{ code: false, text: "Second para." }]),
      text([{ code: false, text: "Third." }]),
    ]);
  });

  test("collapses the model's own hard wraps inside a paragraph", () => {
    // These line breaks were chosen for a terminal, not for this panel.
    // Honouring them is what made answers read as preformatted output.
    const blocks = parseAnswer(
      "You are getting a ValueError, which means\nPython found something that is\nnot quite right.",
    );

    expect(blocks).toEqual([
      text([
        {
          code: false,
          text:
            "You are getting a ValueError, which means Python found " +
            "something that is not quite right.",
        },
      ]),
    ]);
  });

  test("keeps line breaks inside code, where they are meaningful", () => {
    const blocks = parseAnswer("```python\nfoo = 1\nprint(foo)\n```");
    expect(blocks[0].content).toEqual("foo = 1\nprint(foo)");
  });

  test("drops blank text between blocks", () => {
    const blocks = parseAnswer("```\nx\n```\n\n\n```\ny\n```");
    expect(blocks.map((b) => b.type)).toEqual(["code", "code"]);
  });

  test("copes with empty and missing input", () => {
    expect(parseAnswer("")).toEqual([]);
    expect(parseAnswer()).toEqual([]);
  });
});

describe("parseAnswer with highlight terms", () => {
  const terms = { name: "kittens", file: "main.py" };
  const spansOf = (answer, withTerms = terms) =>
    parseAnswer(answer, withTerms)[0].spans;

  test("tags the variable, file and line in plain text", () => {
    expect(
      spansOf("Look at line 2 in main.py, where kittens is used."),
    ).toEqual([
      { code: false, text: "Look at " },
      { code: false, text: "line 2", highlight: "line" },
      { code: false, text: " in " },
      { code: false, text: "main.py", highlight: "file" },
      { code: false, text: ", where " },
      { code: false, text: "kittens", highlight: "var" },
      { code: false, text: " is used." },
    ]);
  });

  test("tags any line number, not just the error's", () => {
    expect(spansOf("Line 8 defines it.")).toEqual([
      { code: false, text: "Line 8", highlight: "line" },
      { code: false, text: " defines it." },
    ]);
  });

  test("only matches the variable as a whole, case-sensitive name", () => {
    expect(spansOf("kittens2 and Kittens and mykittens")).toEqual([
      { code: false, text: "kittens2 and Kittens and mykittens" },
    ]);
  });

  test("colours backticked code by what it names", () => {
    expect(spansOf("`kittens` in `main.py` is not `print(cats)`")).toEqual([
      { code: true, text: "kittens", highlight: "var" },
      { code: false, text: " in " },
      { code: true, text: "main.py", highlight: "file" },
      { code: false, text: " is not " },
      { code: true, text: "print(cats)", highlight: "code" },
    ]);
  });

  test("treats names as literal text, not as patterns", () => {
    expect(spansOf("a.b and axb", { name: "a.b" })).toEqual([
      { code: false, text: "a.b", highlight: "var" },
      { code: false, text: " and axb" },
    ]);
  });

  test("still tags line numbers when no names are known", () => {
    expect(spansOf("See line 3.", {})).toEqual([
      { code: false, text: "See " },
      { code: false, text: "line 3", highlight: "line" },
      { code: false, text: "." },
    ]);
  });

  test("leaves spans untagged without terms", () => {
    expect(parseAnswer("Look at line 2.")[0].spans).toEqual([
      { code: false, text: "Look at line 2." },
    ]);
  });
});

describe("withheldFix", () => {
  test("leaves an answer with no code alone", () => {
    expect(withheldFix("Look at line 1 - nothing gives ar a value.")).toEqual({
      text: "Look at line 1 - nothing gives ar a value.",
      withheld: false,
    });
  });

  test("trims a dangling lead-in even when no code followed it", () => {
    // A model that obeys "write no code" still announces it first, and ends on
    // a colon with nothing after it.
    expect(
      withheldFix("Use `art`, not `ar`.\n\nHere's what you need to change:"),
    ).toEqual({ text: "Use `art`, not `ar`.", withheld: false });
  });

  test("cuts the answer at the first fence", () => {
    const { text: kept, withheld } = withheldFix(
      "You are using `ar` but line 8 defines `art`.\n\n```python\nprint(art)\n```\n\nThat fixes it.",
    );

    expect(kept).toEqual("You are using `ar` but line 8 defines `art`.");
    expect(withheld).toBe(true);
  });

  test("drops a dangling lead-in that introduced the code", () => {
    const { kept } = { kept: undefined };
    expect(
      withheldFix("You are close.\n\nChange the line to:\n\n```python\nx\n```")
        .text,
    ).toEqual("You are close.");
    expect(kept).toBeUndefined();
  });

  test("keeps prose that merely happens to precede the fence", () => {
    expect(
      withheldFix("Nothing gives ar a value.\n```python\nx = 1\n```").text,
    ).toEqual("Nothing gives ar a value.");
  });

  test("returns empty text when the answer was only code", () => {
    expect(withheldFix("```python\nx = 1\n```")).toEqual({
      text: "",
      withheld: true,
    });
  });

  test("copes with empty and missing input", () => {
    expect(withheldFix("")).toEqual({ text: "", withheld: false });
    expect(withheldFix()).toEqual({ text: "", withheld: false });
  });
});
