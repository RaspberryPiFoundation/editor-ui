jest.mock("./utils/dedupeScratchWarnings.js", () => jest.fn());
jest.mock("./assets/stylesheets/Scratch.scss", () => "");
jest.mock("./components/ScratchEditor/ScratchIntegrationHOC.jsx", () => ({
  __esModule: true,
  default: (WrappedComponent) => WrappedComponent,
}));
const mockScratchProjectSave = jest.fn();
jest.mock("./utils/scratchProjectSave.js", () => ({
  __esModule: true,
  default: (params) => mockScratchProjectSave(params),
}));
let mockRender = jest.fn();
let mockCreateRoot = jest.fn();

jest.mock("@scratch/scratch-gui", () => {
  const MockGui = () => null;
  MockGui.setAppElement = jest.fn();
  return {
    __esModule: true,
    default: MockGui,
    AppStateHOC: (WrappedComponent) => WrappedComponent,
  };
});
jest.mock("react-dom/client", () => {
  mockRender = jest.fn();
  mockCreateRoot = jest.fn(() => ({
    render: mockRender,
  }));

  return {
    createRoot: mockCreateRoot,
  };
});

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

  const getRenderedGuiProps = () => {
    const renderTree = mockRender.mock.calls[0][0];
    const renderedChildren = [].concat(renderTree.props.children);

    return renderedChildren[1].props;
  };

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
    mockRender.mockClear();
    mockCreateRoot.mockClear();
    mockScratchProjectSave.mockClear();
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
    postMessageSpy?.mockRestore();
    consoleErrorSpy?.mockRestore();
    removeEventListenerSpy?.mockRestore();
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

  test("routes project saves through scratchFetch metadata after storage init", async () => {
    loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    const scratchGuiProps = getRenderedGuiProps();
    const scratchStorage = {
      scratchFetch: {
        setMetadata: jest.fn(),
        RequestMetadata: {
          ProjectId: "X-Project-ID",
        },
      },
    };

    scratchGuiProps.onStorageInit(scratchStorage);
    await scratchGuiProps.onUpdateProjectData("project-123", '{"targets":[]}', {
      title: "Saved from test",
    });

    expect(scratchStorage.scratchFetch.setMetadata).toHaveBeenNthCalledWith(
      1,
      "X-Project-ID",
      "project-123",
    );
    expect(scratchStorage.scratchFetch.setMetadata).toHaveBeenCalledWith(
      "Authorization",
      "token-123",
    );
    expect(mockScratchProjectSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scratchFetchApi: scratchStorage.scratchFetch,
        apiUrl: "https://api.example.com",
        currentProjectId: "project-123",
        vmState: '{"targets":[]}',
        params: { title: "Saved from test" },
      }),
    );
  });

  test("sets Authorization and X-Project-ID metadata on scratch storage", () => {
    loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    const mockStorage = {
      scratchFetch: {
        setMetadata: jest.fn(),
        RequestMetadata: {
          ProjectId: "X-Project-ID",
        },
      },
    };

    getRenderedGuiProps().onStorageInit(mockStorage);

    expect(mockStorage.scratchFetch.setMetadata).toHaveBeenNthCalledWith(
      1,
      "X-Project-ID",
      "project-123",
    );
    expect(mockStorage.scratchFetch.setMetadata).toHaveBeenNthCalledWith(
      2,
      "Authorization",
      "token-123",
    );
  });

  test("updates X-Project-ID metadata when Scratch switches to a remixed project", () => {
    loadScratchModule();

    const nonce = getHandshakeNonce();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    const mockStorage = {
      scratchFetch: {
        setMetadata: jest.fn(),
        RequestMetadata: {
          ProjectId: "X-Project-ID",
        },
      },
    };

    const scratchGuiProps = getRenderedGuiProps();
    scratchGuiProps.onStorageInit(mockStorage);
    scratchGuiProps.onUpdateProjectId("project-456");

    expect(mockStorage.scratchFetch.setMetadata).toHaveBeenNthCalledWith(
      3,
      "X-Project-ID",
      "project-456",
    );
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

    const nonce = getHandshakeNonce();

    advanceToTimeout();
    dispatchSetTokenMessage({ nonce, accessToken: "token-123" });

    expect(mockCreateRoot).not.toHaveBeenCalled();
  });
});
