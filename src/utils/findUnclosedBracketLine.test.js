import { findUnclosedBracketLine } from "./findUnclosedBracketLine";

describe("findUnclosedBracketLine", () => {
  describe("scanning the whole source", () => {
    test("returns null when every bracket is closed", () => {
      expect(findUnclosedBracketLine('print("hi")\nx = [1, {2: 3}]')).toBe(
        null,
      );
    });

    test("finds an unclosed bracket on the last line", () => {
      expect(findUnclosedBracketLine('import turtle\nprint("hi"')).toBe(2);
    });

    test("ignores a trailing newline", () => {
      expect(findUnclosedBracketLine('x = 1\nprint("hi"\n')).toBe(2);
    });

    test("returns the innermost unclosed bracket", () => {
      expect(findUnclosedBracketLine("x = [\n  foo(1,\n  2")).toBe(2);
    });

    test("ignores brackets that were closed on later lines", () => {
      expect(findUnclosedBracketLine("x = (\n  foo(1)\n")).toBe(1);
    });
  });

  describe("scanning before a given line", () => {
    test("ignores brackets closed on or after that line", () => {
      expect(findUnclosedBracketLine('print("hi"\nx = 1)', 2)).toBe(1);
    });

    test("skips blank lines between the bracket and that line", () => {
      expect(findUnclosedBracketLine('print("hi"\n\n\nx = 1', 4)).toBe(1);
    });

    test("ignores brackets opened on that line", () => {
      expect(findUnclosedBracketLine("x = 1\ny = = (2", 2)).toBe(null);
    });
  });

  describe("ignoring brackets that are not code", () => {
    test("ignores brackets in strings", () => {
      expect(findUnclosedBracketLine("print('(', \"[\")\nx = 1")).toBe(null);
    });

    test("ignores brackets in comments", () => {
      expect(findUnclosedBracketLine("# TODO (later\nx = 1")).toBe(null);
    });

    test("ignores escaped quotes in strings", () => {
      expect(findUnclosedBracketLine('print("\\"(")\nx = 1')).toBe(null);
    });

    test("counts lines inside triple-quoted strings", () => {
      expect(
        findUnclosedBracketLine("\"\"\"\n(\n\"\"\"\nprint('''a\nb'''"),
      ).toBe(4);
    });

    test("ends an unterminated single-quoted string at the newline", () => {
      expect(findUnclosedBracketLine("x = 'oops\nprint(1")).toBe(2);
    });
  });
});
