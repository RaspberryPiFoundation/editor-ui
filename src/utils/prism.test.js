import { processEditorProject } from "@raspberrypifoundation/rpf-markdown-core";
import Prism from "./prism";

describe("Prism setup", () => {
  test.each(["python", "javascript", "css", "markup"])(
    "Registers the %s language",
    (language) => {
      expect(Prism.languages[language]).toBeDefined();
    },
  );

  test.each(["lineNumbers", "lineHighlight", "NormalizeWhitespace"])(
    "Registers the %s plugin",
    (plugin) => {
      expect(Prism.plugins[plugin]).toBeDefined();
    },
  );

  test("Does not highlight the document automatically", () => {
    expect(Prism.manual).toBe(true);
  });
});

describe("Highlighting code blocks from rpf-markdown-core", () => {
  const highlight = (markdown) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = processEditorProject(markdown);
    container
      .querySelectorAll(".language-python")
      .forEach((element) => Prism.highlightElement(element));
    return container;
  };

  const code = "print(1)\nprint(2)\nprint(3)";

  test("Adds line numbers and a line highlight when the fence asks for them", () => {
    const container = highlight(
      "```python line_numbers=true line_highlights=2-3\n" + code + "\n```",
    );

    expect(
      container.querySelectorAll(".line-numbers-rows > span"),
    ).toHaveLength(3);
    expect(container.querySelector(".line-highlight")).toHaveAttribute(
      "data-range",
      "2-3",
    );
  });

  test("Leaves a plain fence without line numbers or a line highlight", () => {
    const container = highlight("```python\n" + code + "\n```");

    expect(container.querySelector(".line-numbers-rows")).toBeNull();
    expect(container.querySelector(".line-highlight")).toBeNull();
  });
});
