const React = require("react");
const { render, waitFor } = require("@testing-library/react");
const { Provider } = require("react-redux");
const configureStore = require("redux-mock-store").default;
const ScratchIntegrationHOC = require("./ScratchIntegrationHOC").default;

jest.mock("file-saver", () => ({ saveAs: jest.fn() }));
jest.mock("@scratch/scratch-gui", () => ({
  remixProject: () => ({ type: "remix" }),
  manualUpdateProject: () => ({ type: "manualUpdate" }),
  setStageSize: () => ({ type: "setStageSize" }),
}));

describe("ScratchIntegrationHOC", () => {
  const mockSaveProjectSb3 = jest.fn();
  const mockLoadProject = jest.fn();
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
    process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS = allowedOrigin;
    const mockStore = configureStore([]);
    store = mockStore({
      scratchGui: {
        vm: {
          saveProjectSb3: mockSaveProjectSb3,
          loadProject: mockLoadProject,
        },
      },
    });
    const Dummy = () =>
      React.createElement("div", { "data-testid": "wrapped" });
    Wrapped = ScratchIntegrationHOC(Dummy);
  });

  afterEach(() => {
    delete process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS;
  });

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
      });
    });
  });
});
