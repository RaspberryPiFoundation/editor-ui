import { render, screen } from "@testing-library/react";
import Prism from "../../../../../utils/prism";
import InstructionsStep from "./InstructionsStep";
import { scratchblocksInit } from "../../../../../utils/scratchblocks";

window.HTMLElement.prototype.scrollTo = vi.fn();
vi.mock("../../../../../utils/scratchblocks", () => ({
  scratchblocksInit: vi.fn(),
}));

beforeEach(() => {
  vi.spyOn(Prism, "highlightElement").mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("When the step has content", () => {
  test("Renders it as-is, without markdown conversion", () => {
    render(<InstructionsStep step={{ content: "<p># not a heading</p>" }} />);

    expect(screen.getByText("# not a heading")).toBeInTheDocument();
  });
});

describe("When the step has markdown_content", () => {
  test("Converts markdown headings to HTML", () => {
    render(<InstructionsStep step={{ markdown_content: "# Title" }} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Title" }),
    ).toBeInTheDocument();
  });

  test("Renders links to open in a new tab", () => {
    render(
      <InstructionsStep
        step={{ markdown_content: "[Link](https://example.com)" }}
      />,
    );

    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});

describe("When markdown attaches a class to inline code", () => {
  const renderMarkdown = (markdown_content) =>
    render(<InstructionsStep step={{ markdown_content }} />).container;

  const scratchBlockClasses = [
    "block3control",
    "block3events",
    "block3extensions",
    "block3looks",
    "block3motion",
    "block3myblocks",
    "block3operators",
    "block3sensing",
    "block3sound",
    "block3variables",
  ];

  test.each(scratchBlockClasses)("Applies %s to the code element", (name) => {
    const container = renderMarkdown(`\`Move\`{:class="${name}"}`);

    const code = container.querySelector("code");
    expect(code).toHaveClass(name);
    expect(code).toHaveTextContent("Move");
  });

  test("Consumes the attribute syntax instead of rendering it", () => {
    const container = renderMarkdown('`Motion`{:class="block3motion"}');

    expect(container.textContent).toContain("Motion");
    expect(container.textContent).not.toContain("{:class");
  });
});

describe("When there is no step", () => {
  test("Renders without crashing", () => {
    const { container } = render(<InstructionsStep step={undefined} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});

describe("Syntax highlighting", () => {
  test("Applies syntax highlighting to code blocks", () => {
    render(
      <InstructionsStep
        step={{ content: "<code class='language-python'>print(1)</code>" }}
      />,
    );

    const codeElement = document.getElementsByClassName("language-python")[0];
    expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });
});

describe("When isScratchProject is true", () => {
  test("Initialises scratchblocks with the step content and language", () => {
    render(
      <InstructionsStep
        step={{ content: "<p>step</p>" }}
        isScratchProject={true}
        language="en"
      />,
    );

    expect(scratchblocksInit).toHaveBeenCalledWith(
      "en",
      expect.any(HTMLElement),
    );
  });
});

describe("When isScratchProject is false", () => {
  test("Does not initialise scratchblocks", () => {
    render(<InstructionsStep step={{ content: "<p>step</p>" }} />);

    expect(scratchblocksInit).not.toHaveBeenCalled();
  });
});

describe("When isQuiz is true", () => {
  test("Dispatches a quizReady event", () => {
    const quizReadyHandler = vi.fn();
    document.addEventListener("editor-quizReady", quizReadyHandler);

    render(
      <InstructionsStep step={{ content: "<p>quiz</p>" }} isQuiz={true} />,
    );

    expect(quizReadyHandler).toHaveBeenCalled();

    document.removeEventListener("editor-quizReady", quizReadyHandler);
  });
});

describe("When isQuiz is false", () => {
  test("Does not dispatch a quizReady event", () => {
    const quizReadyHandler = vi.fn();
    document.addEventListener("editor-quizReady", quizReadyHandler);

    render(<InstructionsStep step={{ content: "<p>step</p>" }} />);

    expect(quizReadyHandler).not.toHaveBeenCalled();

    document.removeEventListener("editor-quizReady", quizReadyHandler);
  });
});
