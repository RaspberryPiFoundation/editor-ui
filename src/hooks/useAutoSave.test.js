import { act, renderHook } from "@testing-library/react";
import { useAutoSave } from "./useAutoSave";
import { syncProject } from "../redux/EditorSlice";

let mockInitialComponents = [];
let mockInitialProjectName = undefined;
let mockInitialProjectInstructions = undefined;
let mockSaving = "idle";
let mockCodeRunInProgress = false;
let mockDispatch;
let resolveSave;
let rejectSave;

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      editor: {
        initialComponents: mockInitialComponents,
        initialProjectName: mockInitialProjectName,
        initialProjectInstructions: mockInitialProjectInstructions,
        saving: mockSaving,
        codeRunInProgress: mockCodeRunInProgress,
      },
    }),
}));

jest.mock("../redux/EditorSlice", () => ({
  ...jest.requireActual("../redux/EditorSlice"),
  syncProject: jest.fn((_) => jest.fn()),
}));

jest.useFakeTimers();

const user1 = {
  access_token: "myAccessToken1",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const project = {
  name: "hello world",
  project_type: "python",
  identifier: "hello-world-project",
  components: [
    {
      name: "main",
      extension: "py",
      content: "# hello",
    },
  ],
  user_id: user1.profile.user,
};

const initialComponents = project.components.map((component) => ({
  name: component.name,
  extension: component.extension,
  content: component.content,
}));

const editedProject = {
  ...project,
  components: [
    {
      ...project.components[0],
      content: "# hello edited",
    },
  ],
};

const saveAction = { type: "SAVE_PROJECT" };
const saveProject = jest.fn(() => saveAction);

beforeEach(() => {
  mockInitialComponents = initialComponents;
  mockInitialProjectName = project.name;
  mockInitialProjectInstructions = project.instructions ?? null;
  mockSaving = "idle";
  mockCodeRunInProgress = false;
  syncProject.mockImplementation(jest.fn((_) => saveProject));

  mockDispatch = jest.fn(() => {
    return new Promise((resolve, reject) => {
      resolveSave = resolve;
      rejectSave = reject;
    });
  });
});

afterEach(() => {
  mockInitialComponents = [];
  mockInitialProjectName = undefined;
  mockInitialProjectInstructions = undefined;
  mockSaving = "idle";
  mockCodeRunInProgress = false;
});

describe("useAutoSave", () => {
  test("does not save when project is unchanged", () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("saves when project has changed", async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    expect(saveProject).toHaveBeenCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });

    await act(async () => {
      resolveSave(saveAction);
      await Promise.resolve();
    });
  });

  test("queues autosave when a save is already in flight", async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave(saveAction);
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(saveProject).toHaveBeenLastCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });
  });

  test("queues autosave when redux saving is pending", () => {
    mockSaving = "pending";

    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("queues autosave while python code is running", () => {
    mockCodeRunInProgress = true;

    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("retries a queued autosave when a python run completes", async () => {
    const { result, rerender } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    mockCodeRunInProgress = true;
    rerender();

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    mockCodeRunInProgress = false;
    rerender();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(saveProject).toHaveBeenCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });
  });

  test("queues autosave during cooldown after a successful auto-save", async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    await act(async () => {
      resolveSave(saveAction);
      await Promise.resolve();
    });

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  test("flushPendingAutoSave bypasses cooldown", async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    await act(async () => {
      resolveSave(saveAction);
      await Promise.resolve();
    });

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    await act(async () => {
      const flushPromise = result.current.flushPendingAutoSave();
      await Promise.resolve();
      resolveSave(saveAction);
      await flushPromise;
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  test("flushPendingAutoSave on pagehide saves pending changes", async () => {
    renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    await act(async () => {
      window.dispatchEvent(new Event("pagehide"));
      await Promise.resolve();
      resolveSave(saveAction);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(saveProject).toHaveBeenCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });
  });

  test("beforeunload warns when project has unsaved autosave-eligible changes", () => {
    renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    const beforeUnloadEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(beforeUnloadEvent);

    expect(beforeUnloadEvent.defaultPrevented).toBe(true);
  });

  test("flushPendingAutoSave waits for a redux save in progress before saving again", async () => {
    const { result, rerender } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    mockSaving = "pending";
    rerender();

    let flushPromise;
    act(() => {
      flushPromise = result.current.flushPendingAutoSave();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    mockSaving = "idle";
    await act(async () => {
      rerender();
    });

    await act(async () => {
      resolveSave(saveAction);
      await flushPromise;
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(saveProject).toHaveBeenCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });
  });

  test("flushPendingAutoSave waits for an in-flight save before saving again", async () => {
    const { result, rerender } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    let flushPromise;
    act(() => {
      flushPromise = result.current.flushPendingAutoSave();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    mockInitialComponents = editedProject.components.map((component) => ({
      name: component.name,
      extension: component.extension,
      content: component.content,
    }));
    rerender();

    await act(async () => {
      resolveSave(saveAction);
      await flushPromise;
    });
  });

  test("rejects flushPendingAutoSave when the save fails", async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    let flushPromise;
    act(() => {
      flushPromise = result.current.flushPendingAutoSave();
    });

    await act(async () => {
      await Promise.resolve();
      rejectSave(new Error("save failed"));
      await expect(flushPromise).rejects.toThrow("autosave failed");
    });
  });

  test("retries a queued autosave after an in-flight save fails", async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        user: user1,
        project: editedProject,
        reactAppApiEndpoint: "http://example.com",
      }),
    );

    act(() => {
      result.current.requestAutoSave();
    });

    act(() => {
      result.current.requestAutoSave();
    });

    await act(async () => {
      rejectSave(new Error("save failed"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(saveProject).toHaveBeenLastCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });
  });
});
