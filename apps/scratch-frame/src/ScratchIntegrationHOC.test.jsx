import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { saveAs } from "file-saver";
import { postScratchGuiEvent } from "./utils/events.js";

const { mockSaveAs, mockPostScratchGuiEvent } = vi.hoisted(() => ({
  mockSaveAs: vi.fn(),
  mockPostScratchGuiEvent: vi.fn(),
}));

vi.mock("file-saver", () => ({ saveAs: mockSaveAs }));
vi.mock("./utils/events.js", () => ({
  postScratchGuiEvent: mockPostScratchGuiEvent,
}));

describe("ScratchIntegrationHOC", () => {
  const mockSaveProjectSb3 = vi.fn();
  const mockLoadProject = vi.fn();
  const mockVm = {
    saveProjectSb3: mockSaveProjectSb3,
    loadProject: mockLoadProject,
    on: vi.fn(),
    removeListener: vi.fn(),
  };
  const allowedOrigin =
    import.meta.env.REACT_APP_ALLOWED_IFRAME_ORIGINS?.split(",")[0] ||
    "http://localhost:3011";
  let store;
  let Wrapped;

  beforeEach(async () => {
    vi.resetModules();
    saveAs.mockClear();
    mockSaveProjectSb3.mockClear();
    mockLoadProject.mockClear();
    mockVm.on.mockClear();
    mockVm.removeListener.mockClear();
    postScratchGuiEvent.mockClear();
    const mockStore = configureStore([]);
    store = mockStore({
      scratchGui: {
        vm: mockVm,
      },
    });
    const Dummy = () =>
      React.createElement("div", { "data-testid": "wrapped" });
    window.GUI = {
      remixProject: () => ({ type: "remix" }),
      manualUpdateProject: () => ({ type: "manualUpdate" }),
      setStageSize: () => ({ type: "setStageSize" }),
    };

    const { default: ScratchIntegrationHOC } =
      await import("./ScratchIntegrationHOC.jsx");
    Wrapped = ScratchIntegrationHOC(Dummy);
  });

  afterEach(() => {
    delete window.GUI;
  });

  const getVmHandler = (eventName) =>
    mockVm.on.mock.calls.find(
      ([registeredEventName]) => registeredEventName === eventName,
    )?.[1];

  describe("scratch-gui-download message", () => {
    it("calls saveProjectSb3 and saveAs with blob and filename", async () => {
      const mockBlob = new Blob(["x"], {
        type: "application/octet-stream",
      });
      mockSaveProjectSb3.mockResolvedValue(mockBlob);

      render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: allowedOrigin,
          data: {
            type: "scratch-gui-download",
            filename: "my-project.sb3",
          },
        }),
      );

      await waitFor(() => {
        expect(saveAs).toHaveBeenCalledWith(mockBlob, "my-project.sb3");
      });
      expect(mockSaveProjectSb3).toHaveBeenCalledTimes(1);
    });
  });

  describe("scratch-gui-upload message", () => {
    it("calls loadProject with arrayBuffer from event.data.file", async () => {
      const arrayBuffer = new ArrayBuffer(8);
      const file = {
        arrayBuffer: vi.fn().mockResolvedValue(arrayBuffer),
      };
      mockLoadProject.mockResolvedValue();

      render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: allowedOrigin,
          data: {
            type: "scratch-gui-upload",
            file,
          },
        }),
      );

      await waitFor(() => {
        expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
        expect(mockLoadProject).toHaveBeenCalledWith(arrayBuffer);
        expect(postScratchGuiEvent).toHaveBeenCalledWith(
          "scratch-gui-project-changed",
        );
      });
    });

    describe("Scratch VM project changes", () => {
      it("posts a project-changed event to the parent window", () => {
        render(
          React.createElement(
            Provider,
            { store },
            React.createElement(Wrapped),
          ),
        );

        getVmHandler("PROJECT_CHANGED")();

        expect(postScratchGuiEvent).toHaveBeenCalledWith(
          "scratch-gui-project-changed",
        );
      });
    });
  });

  describe("Scratch VM run events", () => {
    it("registers a PROJECT_RUN_START listener on mount", () => {
      render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );

      expect(mockVm.on).toHaveBeenCalledWith(
        "PROJECT_RUN_START",
        expect.any(Function),
      );
    });

    it("removes the PROJECT_RUN_START listener on unmount", () => {
      const { unmount } = render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );
      const handler = getVmHandler("PROJECT_RUN_START");

      unmount();

      expect(mockVm.removeListener).toHaveBeenCalledWith(
        "PROJECT_RUN_START",
        handler,
      );
    });

    it("posts a project-run-started event when PROJECT_RUN_START fires", () => {
      render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );

      getVmHandler("PROJECT_RUN_START")();

      expect(postScratchGuiEvent).toHaveBeenCalledWith(
        "scratch-gui-project-run-started",
      );
    });

    it("registers a PROJECT_RUN_STOP listener on mount", () => {
      render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );

      expect(mockVm.on).toHaveBeenCalledWith(
        "PROJECT_RUN_STOP",
        expect.any(Function),
      );
    });

    it("posts a project-run-stopped event when PROJECT_RUN_STOP fires", () => {
      render(
        React.createElement(Provider, { store }, React.createElement(Wrapped)),
      );

      getVmHandler("PROJECT_RUN_STOP")();

      expect(postScratchGuiEvent).toHaveBeenCalledWith(
        "scratch-gui-project-run-stopped",
      );
    });
  });
});
