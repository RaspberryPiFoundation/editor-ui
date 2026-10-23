// Streaming client for a local Ollama server.
//
// The request body mirrors Runner#body_for in the SLM evaluation harness
// (slm-evaluation/lib/runner.rb) so that answers seen here are comparable with
// its scored runs. The one intentional difference is `stream: true`: the harness
// waits for the whole response, but a 2-4B model can take several seconds and a
// learner staring at a spinner is a worse demo than text arriving as it is
// generated. Nothing about the generated text itself changes.

export const TEMPERATURE = 0.7;
export const MAX_TOKENS = 400;

// Why the caller cares which of these happened: "Ollama is not running" and
// "that model has not been pulled" need different copy, and an abort is not an
// error the learner should ever see.
export const OLLAMA_ERROR_KINDS = {
  unreachable: "unreachable",
  modelMissing: "modelMissing",
  server: "server",
  aborted: "aborted",
};

export class OllamaError extends Error {
  constructor(kind, message, { status } = {}) {
    super(message);
    this.name = "OllamaError";
    this.kind = kind;
    this.status = status;
  }
}

export const buildRequestBody = (model, messages) => ({
  model,
  messages,
  stream: true,
  // Reasoning models otherwise spend the whole token budget on
  // `message.thinking` and answer with empty `content` - the harness saw
  // qwen3.5:4b use all 400 tokens reasoning and say nothing. Sent to every
  // model, not just the ones that declare the capability, because Ollama
  // accepts it either way.
  think: false,
  options: { temperature: TEMPERATURE, num_predict: MAX_TOKENS },
});

// Ollama streams newline-delimited JSON. A chunk boundary can fall mid-line, so
// hold the trailing partial line back until the rest of it arrives.
const consumeLines = (buffer, onLine) => {
  const lines = buffer.split("\n");
  const remainder = lines.pop() ?? "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      onLine(trimmed);
    }
  }
  return remainder;
};

/**
 * Stream a chat completion, calling onToken with each fragment of content.
 *
 * Resolves with { text, truncated }. `truncated` means the model ran out of
 * token budget rather than finishing its answer, which is worth telling the
 * learner about so a sentence cut off mid-word does not look like a bug.
 */
export const streamChat = async ({
  url,
  model,
  messages,
  signal,
  onToken = () => {},
}) => {
  let response;
  try {
    response = await fetch(`${url.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequestBody(model, messages)),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new OllamaError(OLLAMA_ERROR_KINDS.aborted, "Request aborted");
    }
    // fetch only rejects on a network-level failure, which here means Ollama is
    // not running, is on another port, or refused the origin via CORS.
    throw new OllamaError(
      OLLAMA_ERROR_KINDS.unreachable,
      `Could not reach Ollama at ${url}`,
    );
  }

  if (!response.ok) {
    // Ollama answers 404 for a model it has not pulled.
    const kind =
      response.status === 404
        ? OLLAMA_ERROR_KINDS.modelMissing
        : OLLAMA_ERROR_KINDS.server;
    throw new OllamaError(kind, `Ollama returned ${response.status}`, {
      status: response.status,
    });
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new OllamaError(
      OLLAMA_ERROR_KINDS.server,
      "Ollama returned no response body",
    );
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let truncated = false;

  const handleLine = (line) => {
    let chunk;
    try {
      chunk = JSON.parse(line);
    } catch {
      // A malformed line is not worth failing the whole response over.
      return;
    }
    if (chunk.error) {
      throw new OllamaError(OLLAMA_ERROR_KINDS.server, chunk.error);
    }
    const content = chunk.message?.content;
    if (content) {
      text += content;
      onToken(content);
    }
    if (chunk.done && chunk.done_reason === "length") {
      truncated = true;
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      buffer = consumeLines(buffer, handleLine);
    }
    consumeLines(`${buffer}\n`, handleLine);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new OllamaError(OLLAMA_ERROR_KINDS.aborted, "Request aborted");
    }
    throw error;
  }

  return { text, truncated };
};
