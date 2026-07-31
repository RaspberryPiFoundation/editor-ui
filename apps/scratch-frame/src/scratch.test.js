import { createRoot } from "react-dom/client";

vi.mock("./utils/dedupeScratchWarnings.js", () => ({
  default: vi.fn(),
}));
vi.mock("./stylesheets/Scratch.scss", () => "");
const { mockRenderRoot } = vi.hoisted(() => ({
  mockRenderRoot: vi.fn(),
}));

vi.mock("./WrappedScratchGui.jsx", () => ({
  default: () => null,
}));

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: mockRenderRoot,
  })),
}));

describe("scratch handshake retries", () => {
  const originalEnv = process.env;
  let postMessageSpy;
  let consoleErrorSpy;
  let removeEventListenerSpy;

  const loadScratchModule = () => import("./scratch.jsx");

  const getHandshakeNonce = () => postMessageSpy.mock.calls[0][0].nonce;

  const dispatchSetTokenMessage = ({
    nonce,
    accessToken,
    requiresAuth = true,
  }) => {
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: window.location.origin,
        data: {
          type: "scratch-gui-set-token",
          nonce,
          accessToken,
          requiresAuth,
        },
      }),
    );
  };

  const mountScratchEditor = () => {
    dispatchSetTokenMessage({
      nonce: getHandshakeNonce(),
      accessToken: "token-123",
    });

    const renderedTree = mockRenderRoot.mock.calls[0][0];
    return renderedTree.props.children[1].props;
  };

  const advanceToTimeout = () => {
    vi.advanceTimersByTime(15000);
  };

  const expectRetriesStopped = (callsAfterHandshake) => {
    vi.advanceTimersByTime(20000);
    expect(postMessageSpy).toHaveBeenCalledTimes(callsAfterHandshake);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    createRoot.mockClear();
    mockRenderRoot.mockClear();
    process.env = {
      ...originalEnv,
      REACT_APP_SCRATCH_FRAME_URL: "https://scratch-frame.example.com",
    };

    document.body.innerHTML =
      '<div id="app" data-locale="en"></div><div id="scratch-loading"></div>';
    window.history.pushState(
      {},
      "",
      "/scratch.html?project_id=project-123&api_url=https://api.example.com",
    );

    postMessageSpy = vi.spyOn(window.parent, "postMessage");
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    process.env = originalEnv;
    postMessageSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test("retries ready handshake until timeout then stops", async () => {
    await loadScratchModule();

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    advanceToTimeout();

    expect(postMessageSpy).toHaveBeenCalledTimes(15);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[scratch iframe] no scratch-gui-set-token message received before timeout",
    );

    const callsAtTimeout = postMessageSpy.mock.calls.length;
    vi.advanceTimersByTime(5000);
    expect(postMessageSpy).toHaveBeenCalledTimes(callsAtTimeout);
  });

  test("stops retries and mounts after valid token message", async () => {
    await loadScratchModule();
    mountScratchEditor();

    const callsAfterHandshake = postMessageSpy.mock.calls.length;
    expectRetriesStopped(callsAfterHandshake);
  });

  test("passes accessToken as a prop", async () => {
    await loadScratchModule();

    expect(mountScratchEditor().accessToken).toBe("token-123");
  });

  test.each([
    ["ga-IE", "ga"],
    ["es-LA", "es-419"],
    ["fr-FR", "fr"],
  ])(
    "passes the selected %s locale to Scratch as %s",
    async (locale, expected) => {
      window.history.pushState(
        {},
        "",
        `/scratch.html?project_id=project-123&api_url=https://api.example.com&locale=${locale}`,
      );

      await loadScratchModule();
      expect(mountScratchEditor().locale).toBe(expected);
    },
  );

  test("preserves a native Scratch locale from the legacy data attribute", async () => {
    document.getElementById("app").dataset.locale = "gd";

    await loadScratchModule();
    expect(mountScratchEditor().locale).toBe("gd");
  });

  test("keeps retrying when auth is required but token is missing", async () => {
    await loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: null });

    const callsAfterNullToken = postMessageSpy.mock.calls.length;
    vi.advanceTimersByTime(1000);
    expect(postMessageSpy.mock.calls.length).toBeGreaterThan(
      callsAfterNullToken,
    );

    const callsAfterOneRetry = postMessageSpy.mock.calls.length;
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    expectRetriesStopped(callsAfterOneRetry);
  });

  test("logs auth-specific timeout error when auth is required but token never arrives", async () => {
    await loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: null });
    advanceToTimeout();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[scratch iframe] auth required but access token missing before timeout",
    );
  });

  test("removes message listener when handshake times out", async () => {
    await loadScratchModule();
    advanceToTimeout();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });

  test("ignores late token messages after timeout", async () => {
    await loadScratchModule();

    const nonce = getHandshakeNonce();

    advanceToTimeout();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    expect(createRoot).not.toHaveBeenCalled();
  });
});
