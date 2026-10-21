import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import AiErrorHelp from "./AiErrorHelp";

expect.extend(toHaveNoViolations);

const middlewares = [];
const mockStore = configureStore(middlewares);

const DETAIL_HTML =
  '<div class="pfem"><p class="pfem__why">Python treats foo as a variable.</p>' +
  '<ul class="pfem__steps"><li>Put foo in quotes.</li></ul></div>';

const friendlyError = {
  html: '<p class="pfem__title">Variable does not exist</p>',
  detailHtml: DETAIL_HTML,
  title: "Variable does not exist",
  summary: "The variable foo is used at line 1 in main.py.",
  why: "Python treats foo as a variable.",
  steps: ["Put foo in quotes."],
};

const buildState = (overrides = {}) => ({
  editor: {
    error: "NameError: name 'foo' is not defined on line 1 of main.py",
    errorDetails: { file: "main.py", line: 1 },
    friendlyError,
    project: {
      components: [{ name: "main", extension: "py", content: "print(foo)" }],
    },
    ...overrides,
  },
});

const renderHelp = (overrides) =>
  render(
    <Provider store={mockStore(buildState(overrides))}>
      <AiErrorHelp />
    </Provider>,
  );

const encoder = new TextEncoder();

// One-chunk streaming response, enough for the component's purposes. A fresh
// reader per call, so several escalations in one test each get their own stream.
const ndjsonResponse = (content, doneReason) => () => {
  const payload =
    `${JSON.stringify({ message: { content } })}\n` +
    `${JSON.stringify({ done: true, done_reason: doneReason })}\n`;
  let sent = false;
  return Promise.resolve({
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: () =>
          Promise.resolve(
            sent
              ? { done: true, value: undefined }
              : ((sent = true),
                { done: false, value: encoder.encode(payload) }),
          ),
      }),
    },
  });
};

const mockOllamaReply = (content, doneReason = "stop") => {
  global.fetch.mockImplementation(ndjsonResponse(content, doneReason));
};

const EXPLAIN_WHY = "output.aiHelp.explainWhy";

const clickButton = (name) =>
  userEvent.click(screen.getByRole("button", { name }));

// Reveal the pre-written `why`, then ask the model for a hint.
const askForHint = async () => {
  await clickButton(EXPLAIN_WHY);
  await clickButton("output.aiHelp.ask.hint");
};

describe("AiErrorHelp", () => {
  const originalUrl = process.env.REACT_APP_OLLAMA_URL;

  beforeEach(() => {
    global.fetch = vi.fn();
    process.env.REACT_APP_OLLAMA_URL = "http://localhost:11434";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.REACT_APP_OLLAMA_URL = originalUrl;
  });

  describe("when a pre-written explanation is available", () => {
    test("shows only the summary and the explain button at first", () => {
      renderHelp();

      expect(screen.getByText("Variable does not exist")).toBeInTheDocument();
      expect(
        screen.queryByText("Python treats foo as a variable."),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("output.aiHelp.title")).not.toBeInTheDocument();
    });

    test("reveals it in place, and calls nothing to show it", async () => {
      const { container } = renderHelp();

      await clickButton(EXPLAIN_WHY);

      const card = container.querySelector(".friendly-error-message");
      expect(card).toHaveTextContent("Python treats foo as a variable.");
      expect(
        screen.queryByRole("button", { name: EXPLAIN_WHY }),
      ).not.toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("offers a hint from AI in a separate card once revealed", async () => {
      const { container } = renderHelp();

      await clickButton(EXPLAIN_WHY);

      const aiCard = container.querySelector(".ai-error-help");
      expect(aiCard).toHaveTextContent("output.aiHelp.title");
      expect(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      ).toBeInTheDocument();
      expect(
        aiCard.contains(screen.getByText("Python treats foo as a variable.")),
      ).toBe(false);
    });

    test("shows the hint from the model", async () => {
      mockOllamaReply("Look at line 1 and check what foo refers to.");
      renderHelp();

      await askForHint();

      await waitFor(() =>
        expect(
          screen.getByText("Look at line 1 and check what foo refers to."),
        ).toBeInTheDocument(),
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole("button", { name: "output.aiHelp.ask.hint" }),
      ).not.toBeInTheDocument();
    });

    test("sends the code, the error and the already-shown explanation", async () => {
      mockOllamaReply("ok");
      renderHelp();

      await askForHint();

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      const userTurn = body.messages[1].content;

      expect(body.messages[0].content).toContain("Do not repeat");
      expect(userTurn).toContain("print(foo)");
      expect(userTurn).toContain("NameError: name 'foo' is not defined");
      expect(userTurn).toContain("Variable does not exist");
    });

    test("says it is generating while the model streams", async () => {
      // A response that never resolves keeps the card in its generating state.
      global.fetch.mockReturnValue(new Promise(() => {}));
      renderHelp();

      await askForHint();

      expect(
        screen.getByText("output.aiHelp.generating.hint"),
      ).toBeInTheDocument();
      expect(screen.getByText("output.aiHelp.disclaimer")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    });

    test("labels the answer as AI-generated", async () => {
      mockOllamaReply("Look at line 1.");
      renderHelp();

      await clickButton(EXPLAIN_WHY);
      expect(
        screen.queryByText("output.aiHelp.disclaimer"),
      ).not.toBeInTheDocument();

      await clickButton("output.aiHelp.ask.hint");

      await waitFor(() =>
        expect(screen.getByText("Look at line 1.")).toBeInTheDocument(),
      );
      expect(screen.getByText("output.aiHelp.title")).toBeInTheDocument();
      expect(screen.getByText("output.aiHelp.disclaimer")).toBeInTheDocument();
    });
  });

  test("shows a learn more link under the answer", async () => {
    mockOllamaReply("Look at line 1.");
    renderHelp();

    await askForHint();

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "output.aiHelp.learnMore" }),
      ).toBeInTheDocument(),
    );
  });

  describe("rendering model output", () => {
    test("shows inline backticks as code", async () => {
      mockOllamaReply("The variable `ar` is not `art`.");
      const { container } = renderHelp({ friendlyError: null });

      await clickButton("output.aiHelp.ask.explain");

      await waitFor(() =>
        expect(
          container.querySelectorAll(".ai-error-help__inline-code"),
        ).to.have.length(2),
      );
      expect(container.textContent).not.toContain("`");
    });

    test("keeps the model-name chip off the answer paragraphs", async () => {
      mockOllamaReply("Look at line 1.");
      const { container } = renderHelp({ friendlyError: null });

      await clickButton("output.aiHelp.ask.explain");

      await waitFor(() =>
        expect(
          container.querySelector(".ai-error-help__model-name"),
        ).not.toBeNull(),
      );
      expect(
        container.querySelector(".ai-error-help__answer").className,
      ).toEqual("ai-error-help__answer");
    });
  });

  describe("withholding the fix", () => {
    test("cuts code out of the hint and says so", async () => {
      mockOllamaReply(
        "You are using `ar` but line 8 defines `art`.\n\n" +
          "Change the line to:\n\n```python\nprint(art)\n```",
      );
      const { container } = renderHelp();

      await askForHint();

      await waitFor(() =>
        expect(
          screen.getByText("output.aiHelp.fixWithheld"),
        ).toBeInTheDocument(),
      );
      expect(container.textContent).not.toContain("print(art)");
      // The diagnosis before the code is kept, and the dangling lead-in is not.
      expect(container.textContent).to.contain("but line 8 defines");
      expect(container.textContent).not.toContain("Change the line to:");
    });
  });

  describe("when there is no friendly explanation for the error", () => {
    test("shows the AI card straight away and asks for an explanation", async () => {
      mockOllamaReply("That error means...");
      renderHelp({ friendlyError: null });

      expect(
        screen.queryByRole("button", { name: EXPLAIN_WHY }),
      ).not.toBeInTheDocument();

      await clickButton("output.aiHelp.ask.explain");

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.messages[0].content).toContain(
        "only seen the raw Python error",
      );
    });
  });

  describe("when the copydeck matched but has no further detail", () => {
    test("skips the explain button and offers the model", () => {
      renderHelp({ friendlyError: { ...friendlyError, detailHtml: null } });

      expect(
        screen.queryByRole("button", { name: EXPLAIN_WHY }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "output.aiHelp.ask.explain" }),
      ).toBeInTheDocument();
    });
  });

  describe("when no Ollama url is configured", () => {
    beforeEach(() => {
      delete process.env.REACT_APP_OLLAMA_URL;
    });

    test("still offers the pre-written explanation, and nothing more", async () => {
      const { container } = renderHelp();

      await clickButton(EXPLAIN_WHY);

      expect(
        screen.getByText("Python treats foo as a variable."),
      ).toBeInTheDocument();
      expect(container.querySelector(".ai-error-help")).toBeNull();
    });

    test("renders nothing at all when there is no pre-written help either", () => {
      const { container } = renderHelp({ friendlyError: null });

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when Ollama cannot be reached", () => {
    test("says so, and offers the hint again", async () => {
      global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
      renderHelp();

      await askForHint();

      await waitFor(() =>
        expect(
          screen.getByText("output.aiHelp.failure.unreachable"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Python treats foo as a variable."),
      ).toBeInTheDocument();
    });

    test("reports a missing model separately", async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 404 });
      renderHelp({ friendlyError: null });

      await clickButton("output.aiHelp.ask.explain");

      await waitFor(() =>
        expect(
          screen.getByText("output.aiHelp.failure.modelMissing"),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("when the answer is cut short by the token budget", () => {
    test("tells the learner", async () => {
      mockOllamaReply("half a sen", "length");
      renderHelp({ friendlyError: null });

      await clickButton("output.aiHelp.ask.explain");

      await waitFor(() =>
        expect(screen.getByText("output.aiHelp.truncated")).toBeInTheDocument(),
      );
    });
  });

  describe("accessibility", () => {
    test("the buttons have accessible names", async () => {
      renderHelp();

      // The design system Button blanks aria-label unless one is passed, so
      // this is a real regression risk rather than a tautology.
      expect(
        screen.getByRole("button", { name: EXPLAIN_WHY }),
      ).toHaveAccessibleName(EXPLAIN_WHY);
      await clickButton(EXPLAIN_WHY);
      expect(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      ).toHaveAccessibleName("output.aiHelp.ask.hint");
    });

    test("the AI card is a live region before any answer arrives", async () => {
      renderHelp();
      await clickButton(EXPLAIN_WHY);

      // It has to already be in the DOM for a screen reader to announce the
      // streamed answer without focus being stolen.
      const region = screen.getByRole("status");
      expect(region).toHaveAttribute("aria-live", "polite");
      expect(region).toHaveAttribute("aria-busy", "false");
    });

    test("passes AXE with the pre-written explanation shown", async () => {
      const { container } = renderHelp();
      await clickButton(EXPLAIN_WHY);

      expect(await axe(container)).toHaveNoViolations();
    });

    test("passes AXE with a model answer shown", async () => {
      mockOllamaReply("Look at line 1.");
      const { container } = renderHelp();

      await askForHint();
      await waitFor(() =>
        expect(screen.getByText("Look at line 1.")).toBeInTheDocument(),
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  test("strips unsafe markup from the pre-written explanation", async () => {
    const { container } = renderHelp({
      friendlyError: {
        ...friendlyError,
        detailHtml:
          '<p class="pfem__why">Safe</p><script>alert("xss")</script>' +
          '<img src="x" onerror="alert(1)" />',
      },
    });

    await clickButton(EXPLAIN_WHY);

    expect(screen.getByText("Safe")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img[onerror]")).toBeNull();
  });
});
