import pollAiHint, { AiHintPollError } from "./pollAiHint";

const hintId = "6f1c1e2a-3b4d-4e5f-8a9b-0c1d2e3f4a5b";
const intervalMs = 1000;
const timeoutMs = 5000;

const pending = { data: { status: "pending" } };
const completed = { data: { status: "completed", hint: "A friendly hint" } };
const failed = { data: { status: "failed" } };
const httpError = (status) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status } });

let getAiHint;

const startPolling = (signal) => {
  const promise = pollAiHint(hintId, {
    getAiHint,
    signal,
    intervalMs,
    timeoutMs,
  });
  // Stop unhandled rejection warnings before the test awaits it.
  promise.catch(() => {});
  return promise;
};

const expectRejection = async (promise, reason) => {
  await expect(promise).rejects.toBeInstanceOf(AiHintPollError);
  await expect(promise).rejects.toMatchObject({ reason });
};

beforeEach(() => {
  vi.useFakeTimers();
  getAiHint = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
});

test("waits one interval before the first poll", async () => {
  getAiHint.mockResolvedValue(completed);
  startPolling();

  await vi.advanceTimersByTimeAsync(intervalMs - 1);
  expect(getAiHint).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(1);
  expect(getAiHint).toHaveBeenCalledTimes(1);
});

test("passes the id and abort signal to getAiHint", async () => {
  const { signal } = new AbortController();
  getAiHint.mockResolvedValue(completed);
  const promise = startPolling(signal);

  await vi.advanceTimersByTimeAsync(intervalMs);

  await expect(promise).resolves.toBe("A friendly hint");
  expect(getAiHint).toHaveBeenCalledWith(hintId, { signal });
});

test("keeps polling while pending and resolves with the hint", async () => {
  getAiHint
    .mockResolvedValueOnce(pending)
    .mockResolvedValueOnce(pending)
    .mockResolvedValueOnce(completed);
  const promise = startPolling();

  await vi.advanceTimersByTimeAsync(intervalMs * 3);

  await expect(promise).resolves.toBe("A friendly hint");
  expect(getAiHint).toHaveBeenCalledTimes(3);
});

test("rejects when the hint fails", async () => {
  getAiHint.mockResolvedValueOnce(pending).mockResolvedValueOnce(failed);
  const promise = startPolling();

  await vi.advanceTimersByTimeAsync(intervalMs * 2);

  await expectRejection(promise, "failed");
  expect(getAiHint).toHaveBeenCalledTimes(2);
});

test("rejects when a completed hint is empty", async () => {
  getAiHint.mockResolvedValue({ data: { status: "completed", hint: "" } });
  const promise = startPolling();

  await vi.advanceTimersByTimeAsync(intervalMs);

  await expectRejection(promise, "failed");
});

test.each([401, 404])(
  "rejects without retrying on a %i response",
  async (status) => {
    getAiHint.mockRejectedValue(httpError(status));
    const promise = startPolling();

    await vi.advanceTimersByTimeAsync(intervalMs * 3);

    await expectRejection(promise, "failed");
    expect(getAiHint).toHaveBeenCalledTimes(1);
  },
);

test("keeps polling after a network error or 5xx", async () => {
  getAiHint
    .mockRejectedValueOnce(new Error("Network Error"))
    .mockRejectedValueOnce(httpError(503))
    .mockResolvedValueOnce(completed);
  const promise = startPolling();

  await vi.advanceTimersByTimeAsync(intervalMs * 3);

  await expect(promise).resolves.toBe("A friendly hint");
  expect(getAiHint).toHaveBeenCalledTimes(3);
});

test("rejects with a timeout once the deadline passes", async () => {
  getAiHint.mockResolvedValue(pending);
  const promise = startPolling();

  await vi.advanceTimersByTimeAsync(timeoutMs);

  await expectRejection(promise, "timeout");
  expect(getAiHint).toHaveBeenCalledTimes(timeoutMs / intervalMs);
});

test("stops polling when aborted while waiting", async () => {
  const controller = new AbortController();
  getAiHint.mockResolvedValue(pending);
  const promise = startPolling(controller.signal);

  await vi.advanceTimersByTimeAsync(intervalMs);
  controller.abort();
  await vi.advanceTimersByTimeAsync(intervalMs * 3);

  await expectRejection(promise, "aborted");
  expect(getAiHint).toHaveBeenCalledTimes(1);
});

test("rejects as aborted when aborted during a request", async () => {
  const controller = new AbortController();
  getAiHint.mockImplementation(() => {
    controller.abort();
    return Promise.reject(new Error("canceled"));
  });
  const promise = startPolling(controller.signal);

  await vi.advanceTimersByTimeAsync(intervalMs);

  await expectRejection(promise, "aborted");
  expect(getAiHint).toHaveBeenCalledTimes(1);
});

test("does not poll when already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  const promise = startPolling(controller.signal);

  await vi.advanceTimersByTimeAsync(intervalMs);

  await expectRejection(promise, "aborted");
  expect(getAiHint).not.toHaveBeenCalled();
});
