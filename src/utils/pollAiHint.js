// Keep in step with GenerateAiHintJob::MAX_QUEUE_WAIT in editor-api.
export const AI_HINT_POLL_TIMEOUT_MS = 30000;
export const AI_HINT_POLL_INTERVAL_MS = 1000;

export class AiHintPollError extends Error {
  constructor(reason) {
    super(`AI hint ${reason}`);
    this.name = "AiHintPollError";
    this.reason = reason;
  }
}

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(new AiHintPollError("aborted"));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });

const throwIfAborted = (signal) => {
  if (signal?.aborted) throw new AiHintPollError("aborted");
};

const pollAiHint = async (
  id,
  {
    getAiHint,
    signal,
    intervalMs = AI_HINT_POLL_INTERVAL_MS,
    timeoutMs = AI_HINT_POLL_TIMEOUT_MS,
  },
) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() + intervalMs <= deadline) {
    throwIfAborted(signal);
    await wait(intervalMs, signal);

    let data;
    try {
      ({ data } = await getAiHint(id, { signal }));
    } catch (error) {
      throwIfAborted(signal);
      // Retry network errors and 5xx; a 4xx won't change.
      const status = error?.response?.status;
      if (status >= 400 && status < 500) throw new AiHintPollError("failed");
      continue;
    }
    throwIfAborted(signal);

    if (data?.status === "completed") {
      if (!data.hint) throw new AiHintPollError("failed");
      return data.hint;
    }
    if (data?.status === "failed") throw new AiHintPollError("failed");
  }

  throw new AiHintPollError("timeout");
};

export default pollAiHint;
