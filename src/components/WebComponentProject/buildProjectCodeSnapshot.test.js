import { buildProjectCodeSnapshot } from "./buildProjectCodeSnapshot";

describe("buildProjectCodeSnapshot", () => {
  test("builds a stable snapshot from project components", () => {
    const components = [
      { name: "main", extension: "py", content: "print('hello')" },
      { name: "utils", extension: "py", content: "def foo(): pass" },
    ];

    expect(buildProjectCodeSnapshot(components)).toBe(
      buildProjectCodeSnapshot([...components].reverse()),
    );
  });

  test("returns an empty string for non-array input", () => {
    expect(buildProjectCodeSnapshot(null)).toBe("");
  });

  test("changes when component content changes", () => {
    const before = buildProjectCodeSnapshot([
      { name: "main", extension: "py", content: "print(1)" },
    ]);
    const after = buildProjectCodeSnapshot([
      { name: "main", extension: "py", content: "print(2)" },
    ]);

    expect(before).not.toBe(after);
  });
});
