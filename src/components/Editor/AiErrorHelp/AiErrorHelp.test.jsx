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

// Click the next rung and wait for any streamed answer to land, so that the
// button for the rung after it has re-enabled.
const escalate = async (level) => {
  await userEvent.click(
    screen.getByRole("button", { name: `output.aiHelp.ask.${level}` }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: `output.aiHelp.ask.${level}` }),
    ).not.toBeInTheDocument(),
  );
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
    test("offers it first, and calls nothing to show it", async () => {
      renderHelp();

      const button = screen.getByRole("button", {
        name: "output.aiHelp.ask.prewritten",
      });
      await userEvent.click(button);

      expect(
        screen.getByText("Python treats foo as a variable."),
      ).toBeInTheDocument();
      expect(screen.getByText("Put foo in quotes.")).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("escalates to the model on the second click", async () => {
      mockOllamaReply("Look at line 1 and check what foo refers to.");
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );

      await waitFor(() =>
        expect(
          screen.getByText("Look at line 1 and check what foo refers to."),
        ).toBeInTheDocument(),
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("sends the code, the error and the already-shown explanation", async () => {
      mockOllamaReply("ok");
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      const userTurn = body.messages[1].content;

      expect(body.messages[0].content).toContain("Do not repeat");
      expect(userTurn).toContain("print(foo)");
      expect(userTurn).toContain("NameError: name 'foo' is not defined");
      expect(userTurn).toContain("Variable does not exist");
    });

    test("labels model output as AI-written", async () => {
      mockOllamaReply("Look at line 1.");
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      expect(
        screen.queryByText("output.aiHelp.notice"),
      ).not.toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );

      await waitFor(() =>
        expect(screen.getByText("output.aiHelp.notice")).toBeInTheDocument(),
      );
    });

    test("replays the previous answer when asked for the fix", async () => {
      mockOllamaReply("Look at line 1.");
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );
      await waitFor(() =>
        expect(screen.getByText("Look at line 1.")).toBeInTheDocument(),
      );

      mockOllamaReply("foo = 0");
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.solve" }),
      );

      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
      const body = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(body.messages.map(({ role }) => role)).toEqual([
        "system",
        "user",
        "assistant",
        "user",
      ]);
      expect(body.messages[2].content).toEqual("Look at line 1.");
    });

    test("stops offering help after the last rung", async () => {
      mockOllamaReply("answer");
      renderHelp();

      for (const level of ["prewritten", "hint", "solve"]) {
        await escalate(level);
      }

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("rendering model output", () => {
    test("shows fenced code as code, not literal backticks", async () => {
      mockOllamaReply('Change it to:\n\n```python\nfoo = "hi"\n```');
      const { container } = renderHelp({ friendlyError: null });

      // explain and hint withhold the fix, so escalate to solve to see code.
      await escalate("explain");
      await escalate("hint");
      await escalate("solve");

      await waitFor(() =>
        expect(container.querySelector(".ai-error-help__code")).not.toBeNull(),
      );
      expect(
        container.querySelector(".ai-error-help__code").textContent,
      ).toEqual('foo = "hi"');
      expect(container.textContent).not.toContain("```");
    });

    test("keeps the model-name chip off the answer wrapper", async () => {
      // These were once both `ai-error-help__model`, so the monospace rule for
      // the chip applied to every paragraph of the answer.
      mockOllamaReply("Look at line 1.");
      const { container } = renderHelp({ friendlyError: null });

      await escalate("explain");

      await waitFor(() =>
        expect(
          container.querySelector(".ai-error-help__model-name"),
        ).not.toBeNull(),
      );
      const wrapper = container.querySelector(".ai-error-help__model");
      expect(wrapper).not.toBeNull();
      expect(wrapper.classList.contains("ai-error-help__model-name")).toBe(
        false,
      );
      expect(
        container.querySelector(".ai-error-help__answer").className,
      ).toEqual("ai-error-help__answer");
    });

    test("shows inline backticks as code", async () => {
      mockOllamaReply("The variable `ar` is not `art`.");
      const { container } = renderHelp({ friendlyError: null });

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.explain" }),
      );

      await waitFor(() =>
        expect(
          container.querySelectorAll(".ai-error-help__inline-code"),
        ).to.have.length(2),
      );
      expect(container.textContent).not.toContain("`");
    });
  });

  describe("withholding the fix before the last rung", () => {
    test("cuts code out of the hint rung and says so", async () => {
      mockOllamaReply(
        "You are using `ar` but line 8 defines `art`.\n\n" +
          "Change the line to:\n\n```python\nprint(art)\n```",
      );
      const { container } = renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );

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

    test("lets the solve rung hand over the code", async () => {
      mockOllamaReply("Change it to:\n\n```python\nprint(art)\n```");
      const { container } = renderHelp();

      for (const level of ["prewritten", "hint", "solve"]) {
        await escalate(level);
      }

      await waitFor(() =>
        expect(container.textContent).to.contain("print(art)"),
      );
      // The hint rung withheld its copy of the fix; solve did not.
      expect(screen.getAllByText("output.aiHelp.fixWithheld")).toHaveLength(1);
    });
  });

  describe("when there is no friendly explanation for the error", () => {
    test("goes straight to the model", async () => {
      mockOllamaReply("That error means...");
      renderHelp({ friendlyError: null });

      expect(
        screen.queryByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      ).not.toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.explain" }),
      );

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.messages[0].content).toContain(
        "only seen the raw Python error",
      );
    });
  });

  describe("when the copydeck matched but has no further detail", () => {
    test("skips the pre-written rung", () => {
      renderHelp({ friendlyError: { ...friendlyError, detailHtml: null } });

      expect(
        screen.queryByRole("button", { name: "output.aiHelp.ask.prewritten" }),
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

    test("still offers the pre-written explanation", async () => {
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );

      expect(
        screen.getByText("Python treats foo as a variable."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("renders nothing at all when there is no pre-written help either", () => {
      const { container } = renderHelp({ friendlyError: null });

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when Ollama cannot be reached", () => {
    test("offers the same rung again rather than skipping it", async () => {
      global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );

      await waitFor(() =>
        expect(
          screen.getByText("output.aiHelp.failure.unreachable"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      ).toBeInTheDocument();
    });

    test("says so, and leaves the earlier rungs intact", async () => {
      global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.hint" }),
      );

      await waitFor(() =>
        expect(
          screen.getByText("output.aiHelp.failure.unreachable"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByText("Python treats foo as a variable."),
      ).toBeInTheDocument();
    });

    test("reports a missing model separately", async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 404 });
      renderHelp({ friendlyError: null });

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.explain" }),
      );

      await waitFor(() =>
        expect(
          screen.getByText("output.aiHelp.failure.modelMissing"),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("when the answer is cut short by the token budget", () => {
    test("tells the learner", async () => {
      const payload =
        `${JSON.stringify({ message: { content: "half a sen" } })}\n` +
        `${JSON.stringify({ done: true, done_reason: "length" })}\n`;
      let sent = false;
      global.fetch.mockResolvedValue({
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

      renderHelp({ friendlyError: null });
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.explain" }),
      );

      await waitFor(() =>
        expect(screen.getByText("output.aiHelp.truncated")).toBeInTheDocument(),
      );
    });
  });

  describe("accessibility", () => {
    test("the button has an accessible name", () => {
      renderHelp();

      // The design system Button blanks aria-label unless one is passed, so
      // this is a real regression risk rather than a tautology.
      expect(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      ).toHaveAccessibleName("output.aiHelp.ask.prewritten");
    });

    test("the answer region is a live region before any answer arrives", () => {
      renderHelp();

      // It has to already be in the DOM for a screen reader to announce the
      // streamed answer without focus being stolen.
      const region = screen.getByRole("status");
      expect(region).toHaveAttribute("aria-live", "polite");
      expect(region).toHaveAttribute("aria-busy", "false");
    });

    test("passes AXE with the pre-written explanation shown", async () => {
      const { container } = renderHelp();
      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    test("passes AXE with a model answer shown", async () => {
      mockOllamaReply("Look at line 1.");
      const { container } = renderHelp({ friendlyError: null });

      await userEvent.click(
        screen.getByRole("button", { name: "output.aiHelp.ask.explain" }),
      );
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

    await userEvent.click(
      screen.getByRole("button", { name: "output.aiHelp.ask.prewritten" }),
    );

    expect(screen.getByText("Safe")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img[onerror]")).toBeNull();
  });
});
