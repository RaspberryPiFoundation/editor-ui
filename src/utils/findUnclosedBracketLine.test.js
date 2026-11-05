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

    test("finds an unclosed bracket followed by more code", () => {
      expect(findUnclosedBracketLine('print("hi"\n\n\nx = 1')).toBe(1);
    });
  });

  describe("multi-line brackets that are closed", () => {
    test("returns null for a list with a missing comma", () => {
      expect(findUnclosedBracketLine("nums = [\n  1,\n  2\n  3,\n]")).toBe(
        null,
      );
    });

    test("returns null for a call with a bad token", () => {
      expect(findUnclosedBracketLine("print(\n  'a',\n  = 'b',\n)")).toBe(null);
    });

    test("returns null for a dict with a missing comma", () => {
      expect(findUnclosedBracketLine("d = {\n  'a': 1\n  'b': 2\n}")).toBe(
        null,
      );
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
