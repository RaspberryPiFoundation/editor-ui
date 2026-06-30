const React = require("react");
const { render, waitFor } = require("@testing-library/react");
const { Provider } = require("react-redux");
const configureStore = require("redux-mock-store").default;

jest.mock("file-saver", () => ({ saveAs: jest.fn() }));
jest.mock("./utils/events.js", () => ({ postScratchGuiEvent: jest.fn() }));

const ScratchIntegrationHOC = require("./ScratchIntegrationHOC").default;
const { postScratchGuiEvent } = require("./utils/events.js");

describe("ScratchIntegrationHOC", () => {
  const mockSaveProjectSb3 = jest.fn();
  const mockLoadProject = jest.fn();
  const mockVm = {
    saveProjectSb3: mockSaveProjectSb3,
    loadProject: mockLoadProject,
    on: jest.fn(),
    removeListener: jest.fn(),
  };
  const allowedOrigin = "https://editor.example.com";
  let store;
  let Wrapped;
  let saveAs;

  beforeEach(() => {
    const fileSaver = require("file-saver");
    saveAs = fileSaver.saveAs || fileSaver;
    if (typeof saveAs.mockClear === "function") {
      saveAs.mockClear();
    }
    mockSaveProjectSb3.mockClear();
    mockLoadProject.mockClear();
    mockVm.on.mockClear();
    mockVm.removeListener.mockClear();
    postScratchGuiEvent.mockClear();
    process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS = allowedOrigin;
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
    Wrapped = ScratchIntegrationHOC(Dummy);
  });

  afterEach(() => {
    delete process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS;
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
        arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
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
  });
});
