import {
  FOLLOW_UPS,
  MAX_CODE_CHARS,
  buildAlreadyShownBlock,
  buildCodeBlock,
  buildMessages,
  buildSystemPrompt,
  buildUserTurn,
} from "./buildPrompt";
import {
  BASE_SYSTEM_PROMPT,
  GUIDELINES,
  NO_REPLY_POSSIBLE,
  USER_TURN_REMINDER,
} from "./prompts";

const mainPy = { name: "main", extension: "py", content: "print(foo)\n" };
const helperPy = {
  name: "helper",
  extension: "py",
  content: "def double(n):\n  return n * 2\n",
};

describe("buildSystemPrompt", () => {
  test.each(["explain", "hint", "solve"])(
    "includes the shared base and guidelines for %s",
    (level) => {
      const prompt = buildSystemPrompt(level);
      expect(prompt).toContain(BASE_SYSTEM_PROMPT);
      expect(prompt).toContain(GUIDELINES);
    },
  );

  test.each(["explain", "hint", "solve"])(
    "tells the model %s cannot be replied to",
    (level) => {
      // The verbatim guidelines invite Socratic questions, which strand the
      // learner in a one-shot panel. This must be in every level.
      expect(buildSystemPrompt(level)).toContain(NO_REPLY_POSSIBLE);
    },
  );

  test("ends with the no-reply constraint, which models drop most often", () => {
    const prompt = buildSystemPrompt("solve");
    expect(prompt.endsWith(NO_REPLY_POSSIBLE)).toBe(true);
    expect(prompt.indexOf(NO_REPLY_POSSIBLE)).toBeGreaterThan(
      prompt.indexOf(GUIDELINES),
    );
    expect(prompt.indexOf(NO_REPLY_POSSIBLE)).toBeGreaterThan(
      prompt.indexOf("This overrides the instruction"),
    );
  });

  test("hint tells the model not to repeat the pre-written help", () => {
    expect(buildSystemPrompt("hint")).toMatch(/Do not repeat\s+them/);
  });

  test("only solve overrides the do-not-write-the-code rule", () => {
    expect(buildSystemPrompt("solve")).toContain(
      "This overrides the instruction",
    );
    expect(buildSystemPrompt("hint")).not.toContain(
      "This overrides the instruction",
    );
    expect(buildSystemPrompt("explain")).not.toContain(
      "This overrides the instruction",
    );
  });

  test("throws on an unknown level rather than sending a bare prompt", () => {
    expect(() => buildSystemPrompt("nonsense")).toThrow(
      "Unknown support level: nonsense",
    );
  });
});

describe("buildCodeBlock", () => {
  test("sends a single file bare, matching the evaluation harness", () => {
    expect(buildCodeBlock([mainPy], "main.py")).toEqual("print(foo)");
  });

  test("ignores non-Python components", () => {
    const components = [
      mainPy,
      { name: "index", extension: "html", content: "<p>" },
    ];
    expect(buildCodeBlock(components, "main.py")).toEqual("print(foo)");
  });

  test("labels each file when there is more than one", () => {
    const block = buildCodeBlock([mainPy, helperPy], "main.py");
    expect(block).toEqual(
      "# main.py\nprint(foo)\n\n# helper.py\ndef double(n):\n  return n * 2",
    );
  });

  test("puts the erroring file first even when it is not main.py", () => {
    const block = buildCodeBlock([mainPy, helperPy], "helper.py");
    expect(block.indexOf("# helper.py")).toBeLessThan(
      block.indexOf("# main.py"),
    );
  });

  test("keeps the erroring file whole and drops other files over budget", () => {
    const huge = {
      name: "huge",
      extension: "py",
      content: "x = 1\n".repeat(MAX_CODE_CHARS),
    };
    const block = buildCodeBlock([huge, mainPy], "main.py");

    expect(block).toContain("# main.py");
    expect(block).toContain("print(foo)");
    expect(block).not.toContain("# huge.py");
  });

  test("truncates a single erroring file that alone exceeds the budget", () => {
    const huge = {
      name: "main",
      extension: "py",
      content: "x = 1\n".repeat(MAX_CODE_CHARS),
    };
    const block = buildCodeBlock([huge, helperPy], "main.py");
    expect(block.length).toBeLessThanOrEqual(MAX_CODE_CHARS);
  });

  test("returns an empty string when there is no Python", () => {
    expect(buildCodeBlock([], "main.py")).toEqual("");
    expect(buildCodeBlock(undefined, "main.py")).toEqual("");
  });
});

describe("buildAlreadyShownBlock", () => {
  test("lists the explanation the learner has already read", () => {
    const block = buildAlreadyShownBlock({
      title: "Variable does not exist",
      summary: "The variable foo is used at line 1 in main.py.",
      why: "Python treats foo as a variable.",
      steps: ["Put it in quotes.", "Or create it first."],
    });

    expect(block).toContain("did not help");
    expect(block).toContain("Variable does not exist");
    expect(block).toContain("Python treats foo as a variable.");
    expect(block).toContain("- Put it in quotes.");
    expect(block).toContain("- Or create it first.");
  });

  test("is empty when there was no friendly explanation", () => {
    expect(buildAlreadyShownBlock(null)).toEqual("");
    expect(buildAlreadyShownBlock({})).toEqual("");
  });
});

describe("buildUserTurn", () => {
  test("formats the code and error blocks like the evaluation harness", () => {
    const turn = buildUserTurn({
      components: [mainPy],
      error: "NameError: name 'foo' is not defined on line 1 of main.py\n",
      erroringFile: "main.py",
    });

    expect(turn).toEqual(
      "Here is my Python code:\n\n```python\nprint(foo)\n```\n\n" +
        "This is the error I get:\n\n```\n" +
        "NameError: name 'foo' is not defined on line 1 of main.py\n```\n\n" +
        USER_TURN_REMINDER,
    );
  });

  test("omits blocks it has no content for", () => {
    expect(buildUserTurn({ components: [], error: "" })).toEqual("");
  });

  test("ends with the no-reply reminder", () => {
    const turn = buildUserTurn({
      components: [mainPy],
      error: "NameError",
      erroringFile: "main.py",
    });

    expect(turn.endsWith(USER_TURN_REMINDER)).toBe(true);
  });

  test("appends the already-shown explanation last", () => {
    const turn = buildUserTurn({
      components: [mainPy],
      error: "NameError",
      friendlyError: { title: "Variable does not exist" },
      erroringFile: "main.py",
    });

    expect(turn.indexOf("Variable does not exist")).toBeGreaterThan(
      turn.indexOf("This is the error I get"),
    );
  });
});

describe("buildMessages", () => {
  const context = {
    components: [mainPy],
    error: "NameError",
    erroringFile: "main.py",
  };

  test("sends a system turn then a user turn", () => {
    const messages = buildMessages({ level: "explain", ...context });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toEqual("system");
    expect(messages[1].role).toEqual("user");
    expect(messages[1].content).toContain("print(foo)");
  });

  test("replays the previous answer so the next rung does not repeat it", () => {
    const messages = buildMessages({
      level: "solve",
      previousTurn: { level: "hint", text: "Look at line 1." },
      ...context,
    });

    expect(messages.map(({ role }) => role)).toEqual([
      "system",
      "user",
      "assistant",
      "user",
    ]);
    expect(messages[2].content).toEqual("Look at line 1.");
    expect(messages[3].content).toEqual(FOLLOW_UPS.solve);
  });

  test("ignores an empty previous turn", () => {
    const messages = buildMessages({
      level: "solve",
      previousTurn: { level: "hint", text: "" },
      ...context,
    });

    expect(messages).toHaveLength(2);
  });
});
