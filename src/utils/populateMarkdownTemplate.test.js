import populateMarkdownTemplate from "./populateMarkdownTemplate";

describe("populatemarkdownTemplate", () => {
  const t = (key) => {
    const translations = {
      name: "Alice",
      place: "Wonderland",
    };
    return translations[key];
  };

  it("should replace placeholders with translations", () => {
    const markdown = "Hello, {{name}}! Welcome to {{place}}.";

    const result = populateMarkdownTemplate(markdown, t);
    expect(result).toBe("Hello, Alice! Welcome to Wonderland.");
  });

  it("should leave placeholders unchanged if no translation is found", () => {
    const markdown = "Hello, {{anotherName}}! Welcome to {{anotherPlace}}.";

    const result = populateMarkdownTemplate(markdown, t);
    expect(result).toBe("Hello, {{anotherName}}! Welcome to {{anotherPlace}}.");
  });
});
