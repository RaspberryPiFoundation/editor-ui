import camelCase from "./camelCase";

test("Converts string to camelCase", () => {
  expect(camelCase("My_amazing_project-1")).toBe("myAmazingProject1");
});
