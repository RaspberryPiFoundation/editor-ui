import {
  MAX_TOKENS,
  OLLAMA_ERROR_KINDS,
  TEMPERATURE,
  buildRequestBody,
  streamChat,
} from "./ollamaClient";

const encoder = new TextEncoder();

// Build a Response-alike whose body yields the given strings as separate
// chunks, so we can drive chunk boundaries that fall mid-line.
const streamingResponse = (chunks, { ok = true, status = 200 } = {}) => {
  let index = 0;
  return {
    ok,
    status,
    body: {
      getReader: () => ({
        read: () =>
          Promise.resolve(
            index < chunks.length
              ? { done: false, value: encoder.encode(chunks[index++]) }
              : { done: true, value: undefined },
          ),
      }),
    },
  };
};

const ndjson = (...objects) =>
  objects.map((object) => `${JSON.stringify(object)}\n`).join("");

const messages = [
  { role: "system", content: "system" },
  { role: "user", content: "user" },
];

const call = (options = {}) =>
  streamChat({
    url: "http://localhost:11434",
    model: "llama3.2:3b",
    messages,
    ...options,
  });

describe("buildRequestBody", () => {
  test("mirrors the evaluation harness request, but streaming", () => {
    expect(buildRequestBody("llama3.2:3b", messages)).toEqual({
      model: "llama3.2:3b",
      messages,
      stream: true,
      think: false,
      options: { temperature: TEMPERATURE, num_predict: MAX_TOKENS },
    });
  });

  test("caps the answer length and temperature as the harness does", () => {
    expect(TEMPERATURE).toEqual(0.7);
    expect(MAX_TOKENS).toEqual(400);
  });
});

describe("streamChat", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("posts to /api/chat with the expected body", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([
        ndjson({ message: { content: "hi" } }, { done: true }),
      ]),
    );

    await call();

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toEqual("http://localhost:11434/api/chat");
    expect(options.method).toEqual("POST");
    expect(JSON.parse(options.body)).toEqual(
      buildRequestBody("llama3.2:3b", messages),
    );
  });

  test("does not double up the slash when the url has a trailing one", async () => {
    global.fetch.mockResolvedValue(streamingResponse([ndjson({ done: true })]));

    await call({ url: "http://localhost:11434/" });

    expect(global.fetch.mock.calls[0][0]).toEqual(
      "http://localhost:11434/api/chat",
    );
  });

  test("emits each fragment and returns the joined text", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([
        ndjson(
          { message: { content: "Look " } },
          { message: { content: "at line 1." } },
          { done: true, done_reason: "stop" },
        ),
      ]),
    );

    const onToken = vi.fn();
    const result = await call({ onToken });

    expect(onToken.mock.calls.map(([token]) => token)).toEqual([
      "Look ",
      "at line 1.",
    ]);
    expect(result).toEqual({ text: "Look at line 1.", truncated: false });
  });

  test("reassembles a JSON object split across two chunks", async () => {
    const line = JSON.stringify({ message: { content: "split" } });
    global.fetch.mockResolvedValue(
      streamingResponse([
        line.slice(0, 12),
        `${line.slice(12)}\n${ndjson({ done: true })}`,
      ]),
    );

    const { text } = await call();

    expect(text).toEqual("split");
  });

  test("handles a final line with no trailing newline", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([JSON.stringify({ message: { content: "last" } })]),
    );

    const { text } = await call();

    expect(text).toEqual("last");
  });

  test("reports truncation when the token budget ran out", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([
        ndjson(
          { message: { content: "half a sen" } },
          { done: true, done_reason: "length" },
        ),
      ]),
    );

    const { text, truncated } = await call();

    expect(text).toEqual("half a sen");
    expect(truncated).toBe(true);
  });

  test("ignores a malformed line rather than losing the response", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([
        `not json\n${ndjson({ message: { content: "fine" } }, { done: true })}`,
      ]),
    );

    const { text } = await call();

    expect(text).toEqual("fine");
  });

  test("flags an unreachable server when fetch rejects", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(call()).rejects.toMatchObject({
      kind: OLLAMA_ERROR_KINDS.unreachable,
    });
  });

  test("flags a missing model on 404", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([], { ok: false, status: 404 }),
    );

    await expect(call()).rejects.toMatchObject({
      kind: OLLAMA_ERROR_KINDS.modelMissing,
      status: 404,
    });
  });

  test("flags a server error on any other non-2xx", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([], { ok: false, status: 500 }),
    );

    await expect(call()).rejects.toMatchObject({
      kind: OLLAMA_ERROR_KINDS.server,
      status: 500,
    });
  });

  test("surfaces an error reported inside the stream", async () => {
    global.fetch.mockResolvedValue(
      streamingResponse([
        ndjson({ error: "model requires more system memory" }),
      ]),
    );

    await expect(call()).rejects.toMatchObject({
      kind: OLLAMA_ERROR_KINDS.server,
      message: "model requires more system memory",
    });
  });

  test("reports an abort distinctly so it can be ignored", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    global.fetch.mockRejectedValue(abortError);

    await expect(call()).rejects.toMatchObject({
      kind: OLLAMA_ERROR_KINDS.aborted,
    });
  });

  test("reports an abort that happens mid-stream", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: { getReader: () => ({ read: () => Promise.reject(abortError) }) },
    });

    await expect(call()).rejects.toMatchObject({
      kind: OLLAMA_ERROR_KINDS.aborted,
    });
  });
});
