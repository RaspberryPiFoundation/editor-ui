import { render, cleanup, act } from "@testing-library/react";
import ScratchEditor from "./ScratchEditor.jsx";

const mockWrappedScratchGui = jest.fn();
const mockScratchProjectSave = jest.fn();

jest.mock("../../utils/scratchProjectSave.js", () => ({
  __esModule: true,
  default: (params) => mockScratchProjectSave(params),
}));

jest.mock("./WrappedScratchGui.jsx", () => (props) => {
  mockWrappedScratchGui(props);
  return <div data-testid="wrapped-scratch-gui" />;
});

describe("ScratchEditor", () => {
  afterEach(() => {
    cleanup();
    mockWrappedScratchGui.mockClear();
    mockScratchProjectSave.mockClear();
  });

  test("renders WrappedScratchGui when editor is rendered", () => {
    const { getByTestId } = render(
      <ScratchEditor
        projectId="project-123"
        locale="en"
        apiUrl="https://api.example.com"
        accessToken="token-123"
      />,
    );

    expect(getByTestId("wrapped-scratch-gui")).toBeTruthy();
  });

  test("routes project saves through scratchFetch metadata after storage init", async () => {
    render(
      <ScratchEditor
        projectId="project-123"
        locale="en"
        apiUrl="https://api.example.com"
        accessToken="token-123"
      />,
    );

    const scratchGuiProps = mockWrappedScratchGui.mock.calls[0][0];
    const scratchStorage = {
      scratchFetch: {
        setMetadata: jest.fn(),
      },
    };

    scratchGuiProps.onStorageInit(scratchStorage);
    await scratchGuiProps.onUpdateProjectData("project-123", '{"targets":[]}', {
      title: "Saved from test",
    });

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

  test("updates scratchFetch metadata when scratch-gui-update-token message is received", () => {
    render(
      <ScratchEditor
        projectId="project-123"
        locale="en"
        apiUrl="https://api.example.com"
        accessToken="token-123"
      />,
    );

    const scratchGuiProps = mockWrappedScratchGui.mock.calls[0][0];
    const scratchStorage = {
      scratchFetch: {
        setMetadata: jest.fn(),
      },
    };

    scratchGuiProps.onStorageInit(scratchStorage);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: "scratch-gui-update-token",
            accessToken: "new-token",
          },
        }),
      );
    });

    expect(scratchStorage.scratchFetch.setMetadata).toHaveBeenCalledWith(
      "Authorization",
      "new-token",
    );
  });
});
