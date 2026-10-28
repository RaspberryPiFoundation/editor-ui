import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import ScratchEditor from "./ScratchEditor.jsx";

const { mockWrappedScratchGui, mockScratchProjectSave } = vi.hoisted(() => ({
  mockWrappedScratchGui: vi.fn(),
  mockScratchProjectSave: vi.fn(),
}));

vi.mock("./utils/scratchProjectSave.js", () => ({
  __esModule: true,
  default: (params) => mockScratchProjectSave(params),
}));

vi.mock("./WrappedScratchGui.jsx", () => ({
  default: (props) => {
    mockWrappedScratchGui(props);
    return <div data-testid="wrapped-scratch-gui" />;
  },
}));

describe("ScratchEditor", () => {
  afterEach(() => {
    cleanup();
    mockWrappedScratchGui.mockClear();
    mockScratchProjectSave.mockClear();
  });

  describe("asset upload failures", () => {
    const renderEditor = () => {
      render(
        <ScratchEditor
          projectId="project-123"
          locale="en"
          apiUrl="https://api.example.com"
          accessToken="token-123"
        />,
      );
      return mockWrappedScratchGui.mock.calls[0][0];
    };

    const storageStub = (store) => ({
      scratchFetch: { setMetadata: vi.fn() },
      store,
    });

    let postMessageSpy;

    beforeEach(() => {
      postMessageSpy = vi
        .spyOn(window.parent, "postMessage")
        .mockImplementation(() => {});
    });

    afterEach(() => {
      postMessageSpy.mockRestore();
    });

    const postedEvent = (type) =>
      postMessageSpy.mock.calls
        .map(([message]) => message)
        .find((message) => message.type === type);

    test("preserves the original rejection when wrapping store", async () => {
      const scratchGuiProps = renderEditor();
      const originalStore = vi.fn().mockRejectedValue(413);
      const storage = storageStub(originalStore);

      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store("a", "b", "c", "d")).rejects.toBe(413);
      expect(originalStore).toHaveBeenCalledWith("a", "b", "c", "d");
    });

    test("reports an oversized asset when the save fails", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(413));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(413);
      scratchGuiProps.onShowAlert("savingError");

      expect(postedEvent("scratch-gui-saving-failed")).toEqual({
        type: "scratch-gui-saving-failed",
        reason: "asset_too_large",
      });
    });

    test("reports an oversized project when the save fails", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(422));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(422);
      scratchGuiProps.onShowAlert("savingError");

      expect(postedEvent("scratch-gui-saving-failed")).toEqual({
        type: "scratch-gui-saving-failed",
        reason: "project_too_large",
      });
    });

    test("does not report a reason for unrelated failures", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(500));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(500);
      scratchGuiProps.onShowAlert("savingError");

      expect(postedEvent("scratch-gui-saving-failed")).toEqual({
        type: "scratch-gui-saving-failed",
      });
    });

    test("reports an oversized asset when a remix fails", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(413));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(413);
      scratchGuiProps.onShowAlert("creatingError");

      expect(postedEvent("scratch-gui-remixing-failed")).toEqual({
        type: "scratch-gui-remixing-failed",
        reason: "asset_too_large",
      });
    });

    test("reports an oversized project when a remix fails", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(413));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(413);
      scratchGuiProps.onShowAlert("creatingError");

      expect(postedEvent("scratch-gui-remixing-failed")).toEqual({
        type: "scratch-gui-remixing-failed",
        reason: "asset_too_large",
      });
    });

    test("does not carry a stale reason into the next save", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(413));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(413);
      scratchGuiProps.onShowSavingAlert();
      scratchGuiProps.onShowAlert("savingError");

      expect(postedEvent("scratch-gui-saving-failed")).toEqual({
        type: "scratch-gui-saving-failed",
      });
    });

    test("reports the reason only once per failure", async () => {
      const scratchGuiProps = renderEditor();
      const storage = storageStub(vi.fn().mockRejectedValue(413));
      scratchGuiProps.onStorageInit(storage);

      await expect(storage.store()).rejects.toBe(413);
      scratchGuiProps.onShowAlert("savingError");
      postMessageSpy.mockClear();
      scratchGuiProps.onShowAlert("savingError");

      expect(postedEvent("scratch-gui-saving-failed")).toEqual({
        type: "scratch-gui-saving-failed",
      });
    });
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
    expect(mockWrappedScratchGui).toHaveBeenCalledWith(
      expect.objectContaining({
        assetHost: "https://api.example.com/api/scratch/assets",
        projectHost: "https://api.example.com/api/scratch/projects",
      }),
    );
  });

  test("passes the updated project id to the Scratch GUI after a remix", () => {
    render(
      <ScratchEditor
        projectId="project-123"
        locale="en"
        apiUrl="https://api.example.com"
        accessToken="token-123"
      />,
    );

    act(() => {
      mockWrappedScratchGui.mock.calls[0][0].onUpdateProjectId("remix-456");
    });

    expect(mockWrappedScratchGui).toHaveBeenLastCalledWith(
      expect.objectContaining({ projectId: "remix-456" }),
    );
  });

  test("disables the Scratch GUI's own beforeunload handler", () => {
    render(
      <ScratchEditor
        projectId="project-123"
        locale="en"
        apiUrl="https://api.example.com"
        accessToken="token-123"
      />,
    );

    expect(mockWrappedScratchGui).toHaveBeenCalledWith(
      expect.objectContaining({
        noBeforeUnloadHandler: true,
      }),
    );
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
        setMetadata: vi.fn(),
      },
      store: vi.fn().mockResolvedValue({}),
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

  test("sends the project locale with scratch requests after storage init", () => {
    render(
      <ScratchEditor
        projectId="project-123"
        locale="fr"
        apiUrl="https://api.example.com"
        accessToken="token-123"
        projectLocale="fr-FR"
      />,
    );

    const scratchGuiProps = mockWrappedScratchGui.mock.calls[0][0];
    const scratchStorage = {
      scratchFetch: {
        setMetadata: vi.fn(),
      },
      store: vi.fn().mockResolvedValue({}),
    };

    scratchGuiProps.onStorageInit(scratchStorage);

    expect(scratchStorage.scratchFetch.setMetadata).toHaveBeenCalledWith(
      "X-Project-Locale",
      "fr-FR",
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
        setMetadata: vi.fn(),
      },
      store: vi.fn().mockResolvedValue({}),
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
