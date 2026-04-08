jest.mock("./utils/dedupeScratchWarnings.js", () => jest.fn());
jest.mock("./assets/stylesheets/Scratch.scss", () => "");
jest.mock("./components/ScratchEditor/ScratchIntegrationHOC.jsx", () => ({
  __esModule: true,
  default: (WrappedComponent) => WrappedComponent,
}));
jest.mock("@scratch/scratch-gui", () => {
  const MockGui = () => null;
  MockGui.setAppElement = jest.fn();
  return {
    __esModule: true,
    default: MockGui,
    AppStateHOC: (WrappedComponent) => WrappedComponent,
  };
});
jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

describe("scratch handshake retries", () => {
  const originalEnv = process.env;
  let postMessageSpy;
  let consoleErrorSpy;
  let removeEventListenerSpy;

  const loadScratchModule = () => {
    jest.isolateModules(() => {
      require("./scratch.jsx");
    });
  };

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

  const advanceToTimeout = () => {
    jest.advanceTimersByTime(15000);
  };

  const expectRetriesStopped = (callsAfterHandshake) => {
    jest.advanceTimersByTime(20000);
    expect(postMessageSpy).toHaveBeenCalledTimes(callsAfterHandshake);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    process.env = {
      ...originalEnv,
      ASSETS_URL: "https://assets.example.com",
    };

    document.body.innerHTML =
      '<div id="app" data-locale="en"></div><div id="scratch-loading"></div>';
    window.history.pushState(
      {},
      "",
      "/scratch.html?project_id=project-123&api_url=https://api.example.com",
    );

    postMessageSpy = jest.spyOn(window.parent, "postMessage");
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    process.env = originalEnv;
    postMessageSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test("retries ready handshake until timeout then stops", () => {
    loadScratchModule();

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    advanceToTimeout();

    expect(postMessageSpy).toHaveBeenCalledTimes(15);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[scratch iframe] no scratch-gui-set-token message received before timeout",
    );

    const callsAtTimeout = postMessageSpy.mock.calls.length;
    jest.advanceTimersByTime(5000);
    expect(postMessageSpy).toHaveBeenCalledTimes(callsAtTimeout);
  });

  test("stops retries and mounts after valid token message", () => {
    loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    const callsAfterHandshake = postMessageSpy.mock.calls.length;
    expectRetriesStopped(callsAfterHandshake);
  });

  test("keeps retrying when auth is required but token is missing", () => {
    loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: null });

    const callsAfterNullToken = postMessageSpy.mock.calls.length;
    jest.advanceTimersByTime(1000);
    expect(postMessageSpy.mock.calls.length).toBeGreaterThan(
      callsAfterNullToken,
    );

    const callsAfterOneRetry = postMessageSpy.mock.calls.length;
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    expectRetriesStopped(callsAfterOneRetry);
  });

  test("logs auth-specific timeout error when auth is required but token never arrives", () => {
    loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: null });
    advanceToTimeout();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[scratch iframe] auth required but access token missing before timeout",
    );
  });

  test("removes message listener when handshake times out", () => {
    loadScratchModule();
    advanceToTimeout();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });

  test("ignores late token messages after timeout", () => {
    loadScratchModule();

    const { createRoot } = require("react-dom/client");
    const nonce = getHandshakeNonce();

    advanceToTimeout();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    expect(createRoot).not.toHaveBeenCalled();
  });
});
