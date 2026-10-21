import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import AiErrorHelp from "./AiErrorHelp";

expect.extend(toHaveNoViolations);

const mockStore = configureStore([]);

const friendlyError = {
  html: '<p class="pfem__title">Variable does not exist</p>',
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

// Non-streamed reply, one completion per line as the prompt asks for.
const jsonResponse = (completions) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({ message: { content: completions.join("\n") } }),
  });

// One-chunk streaming response, enough for the component's purposes.
const ndjsonResponse = (content) => {
  const payload =
    `${JSON.stringify({ message: { content } })}\n` +
    `${JSON.stringify({ done: true, done_reason: "stop" })}\n`;
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

// Completions are a non-streamed request, answers a streamed one.
const mockOllama = ({ completions, answer = "Look at line 1." }) => {
  global.fetch.mockImplementation((_url, { body }) =>
    JSON.parse(body).stream
      ? ndjsonResponse(answer)
      : completions instanceof Error
        ? Promise.reject(completions)
        : jsonResponse(completions),
  );
};

const lastRequestBody = () =>
  JSON.parse(global.fetch.mock.calls.at(-1)[1].body);

const starter = (key) =>
  screen.getByRole("button", { name: `output.aiHelp.starterOption.${key}` });

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

  test("offers three prompt starters and calls nothing until one is picked", () => {
    renderHelp();

    expect(starter("explain")).toBeInTheDocument();
    expect(starter("howDoI")).toBeInTheDocument();
    expect(starter("whyDoes")).toBeInTheDocument();
    expect(screen.getByText("output.aiHelp.disclaimer")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("asks the model for ways to finish the chosen starter", async () => {
    mockOllama({ completions: ["create a variable?", "print foo?"] });
    renderHelp();

    await userEvent.click(starter("howDoI"));

    expect(
      await screen.findByRole("button", { name: "create a variable?" }),
    ).toBeInTheDocument();
    const body = lastRequestBody();
    expect(body.stream).toBe(false);
    expect(body.messages[1].content).toContain("print(foo)");
    expect(body.messages[1].content).toContain("output.aiHelp.starter.howDoI");
  });

  test("strips the starter when the model repeats it", async () => {
    mockOllama({
      completions: ["output.aiHelp.starter.howDoI fix it?", "fix it?"],
    });
    renderHelp();

    await userEvent.click(starter("howDoI"));

    expect(
      await screen.findAllByRole("button", { name: "fix it?" }),
    ).toHaveLength(1);
  });

  test("strips numbering, bullets and quotes the model adds", async () => {
    mockOllama({
      completions: ["Here you go:", "1. fix it?", '- "print foo?"', ""],
    });
    renderHelp();

    await userEvent.click(starter("howDoI"));

    expect(
      await screen.findByRole("button", { name: "fix it?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "print foo?" }),
    ).toBeInTheDocument();
  });

  test("falls back to generic completions when the model fails", async () => {
    mockOllama({ completions: new TypeError("Failed to fetch") });
    renderHelp();

    await userEvent.click(starter("whyDoes"));

    expect(
      await screen.findByRole("button", { name: "this error happen?" }),
    ).toBeInTheDocument();
  });

  test("takes the starter back when it is tapped again", async () => {
    mockOllama({ completions: ["fix it?"] });
    renderHelp();

    await userEvent.click(starter("howDoI"));
    await userEvent.click(
      screen.getByRole("button", { name: "output.aiHelp.starter.howDoI" }),
    );

    expect(starter("explain")).toBeInTheDocument();
  });

  test("sends the built question and shows the answer", async () => {
    mockOllama({
      completions: ["print foo?"],
      answer: "Put foo in quotes on line 1.",
    });
    renderHelp();

    await userEvent.click(starter("howDoI"));
    await userEvent.click(
      await screen.findByRole("button", { name: "print foo?" }),
    );

    expect(
      await screen.findByText("Put foo in quotes on line 1."),
    ).toBeInTheDocument();
    expect(screen.getByText("output.aiHelp.responseLabel")).toBeInTheDocument();
    const body = lastRequestBody();
    expect(body.stream).toBe(true);
    expect(body.messages[1].content).toMatch(
      /My question: output\.aiHelp\.starter\.howDoI print foo\?$/,
    );
    // The steps are not on screen in this concept, so the model is not told
    // the learner has seen them.
    expect(body.messages[1].content).not.toContain("Put foo in quotes.");

    // Starters come back so the learner can ask something else.
    expect(starter("explain")).toBeInTheDocument();
  });

  test("withholds code from the answer and says so", async () => {
    mockOllama({
      completions: ["fix it?"],
      answer: "Change line 1:\n\n```python\nprint('foo')\n```",
    });
    renderHelp();

    await userEvent.click(starter("howDoI"));
    await userEvent.click(
      await screen.findByRole("button", { name: "fix it?" }),
    );

    expect(
      await screen.findByText("output.aiHelp.fixWithheld"),
    ).toBeInTheDocument();
    expect(screen.queryByText("print('foo')")).not.toBeInTheDocument();
  });

  test("tells the learner when the help service is unreachable", async () => {
    global.fetch.mockImplementation((_url, { body }) =>
      JSON.parse(body).stream
        ? Promise.reject(new TypeError("Failed to fetch"))
        : jsonResponse(["fix it?"]),
    );
    renderHelp();

    await userEvent.click(starter("howDoI"));
    await userEvent.click(
      await screen.findByRole("button", { name: "fix it?" }),
    );

    expect(
      await screen.findByText("output.aiHelp.failure.unreachable"),
    ).toBeInTheDocument();
  });

  test("renders nothing when no Ollama url is configured", () => {
    process.env.REACT_APP_OLLAMA_URL = "";
    const { container } = renderHelp();

    expect(container).toBeEmptyDOMElement();
  });

  test("passes AXE with an answer shown", async () => {
    mockOllama({ completions: ["fix it?"] });
    const { container } = renderHelp();

    await userEvent.click(starter("howDoI"));
    await userEvent.click(
      await screen.findByRole("button", { name: "fix it?" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Look at line 1.")).toBeInTheDocument(),
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
