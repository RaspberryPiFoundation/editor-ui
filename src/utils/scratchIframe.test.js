import {
  getScratchIframeContentWindow,
  postMessageToScratchIframe,
} from "./scratchIframe";

describe("scratchIframe", () => {
  let mockPostMessage;
  let mockContentWindow;
  let mockShadowQuerySelector;
  let originalQuerySelector;

  beforeEach(() => {
    mockPostMessage = jest.fn();
    mockContentWindow = { postMessage: mockPostMessage };
    mockShadowQuerySelector = jest.fn(() => ({
      contentWindow: mockContentWindow,
    }));
    originalQuerySelector = document.querySelector;
    document.querySelector = jest.fn(() => ({
      shadowRoot: {
        querySelector: mockShadowQuerySelector,
      },
    }));
  });

  afterEach(() => {
    document.querySelector = originalQuerySelector;
  });

  describe("getScratchIframeContentWindow", () => {
    it("returns the Scratch iframe contentWindow", () => {
      const result = getScratchIframeContentWindow();
      expect(document.querySelector).toHaveBeenCalledWith("editor-wc");
      expect(result).toBe(mockContentWindow);
    });

    it("queries iframe by Scratch title", () => {
      getScratchIframeContentWindow();
      expect(mockShadowQuerySelector).toHaveBeenCalledWith(
        "iframe[title='Scratch']",
      );
    });
  });

  describe("postMessageToScratchIframe", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        ASSETS_URL: "https://assets.example.com",
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("calls postMessage on the Scratch iframe with message and ASSETS_URL", () => {
      const message = { type: "scratch-gui-download", filename: "cool.sb3" };
      postMessageToScratchIframe(message);
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith(
        message,
        "https://assets.example.com",
      );
    });
  });
});
