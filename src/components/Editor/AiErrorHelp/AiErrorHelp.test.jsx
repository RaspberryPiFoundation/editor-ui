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

const friendlyError = {
  html: '<p class="pfem__title">Variable does not exist</p>',
  detailHtml: '<p class="pfem__why">Python treats foo as a variable.</p>',
  title: "Variable does not exist",
  summary: "The variable foo is used at line 1 in main.py.",
  why: "Python treats foo as a variable.",
};

const buildState = (overrides = {}) => ({
  editor: {
    error: "NameError: name 'foo' is not defined on line 1 of main.py",
    errorDetails: { type: "NameError", file: "main.py", line: 1 },
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

// One-chunk streaming response. A fresh reader per call, so several questions
// in one test each get their own stream.
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

const NAME_ERROR_KEY = "output.aiHelp.questions.NameError";

const ask = async (key) => {
  await userEvent.click(screen.getByRole("button", { name: key }));
  // The asked question stops being a button once its answer has landed.
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: key })).not.toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(screen.getAllByRole("button")[0]).not.toBeDisabled(),
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

  test("offers the canned questions for the error type", () => {
    renderHelp();

    expect(screen.getByText("output.aiHelp.heading")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual([
      `${NAME_ERROR_KEY}.whatIsVariable`,
      `${NAME_ERROR_KEY}.howCreateVariable`,
      `${NAME_ERROR_KEY}.whereCreateVariable`,
    ]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("falls back to generic questions for other errors", () => {
    renderHelp({ errorDetails: { type: "ZeroDivisionError" } });

    expect(
      screen.getByRole("button", {
        name: "output.aiHelp.questions.generic.whatDoesErrorMean",
      }),
    ).toBeInTheDocument();
  });

  test("sends the chosen question with the code and error", async () => {
    mockOllamaReply("A variable is a name for a value.");
    renderHelp();

    await ask(`${NAME_ERROR_KEY}.whatIsVariable`);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.messages[0].content).toContain("one specific question");
    expect(body.messages[1].content).toContain("print(foo)");
    expect(body.messages[1].content).toContain("NameError");
    expect(body.messages[1].content).toContain(
      `My question is: ${NAME_ERROR_KEY}.whatIsVariable`,
    );
  });

  test("shows the question above its answer and keeps the rest", async () => {
    mockOllamaReply("A variable is a name for a value.");
    renderHelp();

    await ask(`${NAME_ERROR_KEY}.whatIsVariable`);

    expect(
      screen.getByText("A variable is a name for a value."),
    ).toBeInTheDocument();
    expect(screen.getByText(`${NAME_ERROR_KEY}.whatIsVariable`)).toHaveClass(
      "ai-error-help__asked",
    );
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  test("shows a loading state until the first token", async () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    renderHelp();

    await userEvent.click(
      screen.getByRole("button", { name: `${NAME_ERROR_KEY}.whatIsVariable` }),
    );

    expect(screen.getByText("output.aiHelp.loading")).toBeInTheDocument();
    screen
      .getAllByRole("button")
      .forEach((button) => expect(button).toBeDisabled());
  });

  test("stops offering questions once all are asked", async () => {
    mockOllamaReply("An answer.");
    renderHelp();

    await ask(`${NAME_ERROR_KEY}.whatIsVariable`);
    await ask(`${NAME_ERROR_KEY}.howCreateVariable`);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${NAME_ERROR_KEY}.whereCreateVariable`,
      }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("button")).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText("An answer.")).toHaveLength(3);
  });

  test("cuts code out of the answer and says so", async () => {
    mockOllamaReply("Give it a value first.\n\n```python\nfoo = 1\n```");
    renderHelp();

    await ask(`${NAME_ERROR_KEY}.howCreateVariable`);

    expect(screen.getByText("Give it a value first.")).toBeInTheDocument();
    expect(screen.queryByText("foo = 1")).not.toBeInTheDocument();
    expect(screen.getByText("output.aiHelp.fixWithheld")).toBeInTheDocument();
  });

  test("shows inline backticks as code", async () => {
    mockOllamaReply("Look at `foo` on line 1.");
    const { container } = renderHelp();

    await ask(`${NAME_ERROR_KEY}.whatIsVariable`);

    expect(
      container.querySelector(".ai-error-help__inline-code"),
    ).toHaveTextContent("foo");
  });

  test("tells the learner when the answer is cut short", async () => {
    mockOllamaReply("A long answer", "length");
    renderHelp();

    await ask(`${NAME_ERROR_KEY}.whatIsVariable`);

    expect(screen.getByText("output.aiHelp.truncated")).toBeInTheDocument();
  });

  test("renders nothing when no Ollama url is configured", () => {
    process.env.REACT_APP_OLLAMA_URL = "";
    const { container } = renderHelp();

    expect(container).toBeEmptyDOMElement();
  });

  describe("when Ollama cannot be reached", () => {
    beforeEach(() => {
      global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    });

    test("says so, and offers the question again", async () => {
      renderHelp();

      await userEvent.click(
        screen.getByRole("button", {
          name: `${NAME_ERROR_KEY}.whatIsVariable`,
        }),
      );

      expect(
        await screen.findByText("output.aiHelp.failure.unreachable"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: `${NAME_ERROR_KEY}.whatIsVariable`,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("the answers are a live region before any answer arrives", () => {
      renderHelp();

      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    test("passes AXE with questions shown", async () => {
      const { container } = renderHelp();

      expect(await axe(container)).toHaveNoViolations();
    });

    test("passes AXE with an answer shown", async () => {
      mockOllamaReply("A variable is a name for a value.");
      const { container } = renderHelp();

      await ask(`${NAME_ERROR_KEY}.whatIsVariable`);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
