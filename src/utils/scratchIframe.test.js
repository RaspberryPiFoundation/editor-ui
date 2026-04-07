import {
  getScratchIframeContentWindow,
  getScratchAllowedOrigin,
  postMessageToScratchIframe,
  shouldRemixScratchProjectOnSave,
  subscribeToScratchProjectIdentifierUpdates,
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

    it("uses only the origin when ASSETS_URL includes a path", () => {
      process.env = {
        ...originalEnv,
        ASSETS_URL: "https://assets.example.com/branches/main",
      };
      const message = { type: "scratch-gui-download", filename: "cool.sb3" };
      postMessageToScratchIframe(message);
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith(
        message,
        "https://assets.example.com",
      );
    });
  });

  describe("subscribeToScratchProjectIdentifierUpdates", () => {
    const originalAssetsUrl = process.env.ASSETS_URL;

    beforeEach(() => {
      process.env.ASSETS_URL = "https://assets.example.com";
    });

    afterEach(() => {
      process.env.ASSETS_URL = originalAssetsUrl;
    });

    it("calls the handler with the updated project id", () => {
      const handler = jest.fn();
      const unsubscribe = subscribeToScratchProjectIdentifierUpdates(handler);

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://assets.example.com",
          data: {
            type: "scratch-gui-project-id-updated",
            projectId: "project-456",
          },
        }),
      );

      expect(handler).toHaveBeenCalledWith("project-456");
      unsubscribe();
    });

    it("accepts updates when ASSETS_URL contains a path", () => {
      process.env.ASSETS_URL = "https://assets.example.com/branches/main";
      const handler = jest.fn();
      const unsubscribe = subscribeToScratchProjectIdentifierUpdates(handler);

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://assets.example.com",
          data: {
            type: "scratch-gui-project-id-updated",
            projectId: "project-789",
          },
        }),
      );

      expect(handler).toHaveBeenCalledWith("project-789");
      unsubscribe();
    });

    it("ignores unrelated messages", () => {
      const handler = jest.fn();
      const unsubscribe = subscribeToScratchProjectIdentifierUpdates(handler);

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://other.example.com",
          data: {
            type: "scratch-gui-project-id-updated",
            projectId: "project-456",
          },
        }),
      );

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://assets.example.com",
          data: {
            type: "scratch-gui-saving-succeeded",
          },
        }),
      );

      expect(handler).not.toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe("getScratchAllowedOrigin", () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it("returns origin when ASSETS_URL contains a path", () => {
      process.env = {
        ...originalEnv,
        ASSETS_URL: "https://assets.example.com/branches/main",
      };
      expect(getScratchAllowedOrigin()).toBe("https://assets.example.com");
    });
  });

  describe("shouldRemixScratchProjectOnSave", () => {
    it("returns true for the first save of an educator-owned project", () => {
      expect(
        shouldRemixScratchProjectOnSave({
          user: { profile: { user: "student-id" } },
          identifier: "teacher-project",
          projectOwner: false,
          scratchIframeProjectIdentifier: "teacher-project",
        }),
      ).toBe(true);
    });

    it("returns false after the parent project id has been updated", () => {
      expect(
        shouldRemixScratchProjectOnSave({
          user: { profile: { user: "student-id" } },
          identifier: "student-remix",
          projectOwner: false,
          scratchIframeProjectIdentifier: "teacher-project",
        }),
      ).toBe(false);
    });
  });
});
