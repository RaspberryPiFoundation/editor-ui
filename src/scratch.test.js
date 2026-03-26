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
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let messageHandler;

  const loadScratchModule = () => {
    jest.isolateModules(() => {
      require("./scratch.jsx");
    });
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

    messageHandler = null;
    addEventListenerSpy = jest
      .spyOn(window, "addEventListener")
      .mockImplementation((eventType, handler) => {
        if (eventType === "message") {
          messageHandler = handler;
        }
      });
    removeEventListenerSpy = jest
      .spyOn(window, "removeEventListener")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    process.env = originalEnv;
    postMessageSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test("retries ready handshake until timeout then stops", () => {
    loadScratchModule();

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(15000);

    expect(postMessageSpy).toHaveBeenCalledTimes(15);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[scratch iframe] no scratch-gui-set-token received before timeout",
      expect.objectContaining({
        timeoutMs: 15000,
      }),
    );

    const callsAtTimeout = postMessageSpy.mock.calls.length;
    jest.advanceTimersByTime(5000);
    expect(postMessageSpy).toHaveBeenCalledTimes(callsAtTimeout);
  });

  test("stops retries and mounts after valid token message", () => {
    loadScratchModule();

    const firstReadyPayload = postMessageSpy.mock.calls[0][0];
    const nonce = firstReadyPayload.nonce;

    expect(messageHandler).toBeInstanceOf(Function);

    messageHandler({
      source: window.parent,
      data: {
        type: "scratch-gui-set-token",
        nonce,
        accessToken: "token-123",
      },
    });

    const callsAfterHandshake = postMessageSpy.mock.calls.length;
    jest.advanceTimersByTime(20000);
    expect(postMessageSpy).toHaveBeenCalledTimes(callsAfterHandshake);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });
});
