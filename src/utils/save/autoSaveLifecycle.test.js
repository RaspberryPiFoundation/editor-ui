import { syncProject } from "../../redux/EditorSlice";
import { createAutoSaveLifecycle } from "./autoSaveLifecycle";

jest.mock("../../redux/EditorSlice", () => ({
  ...jest.requireActual("../../redux/EditorSlice"),
  syncProject: jest.fn((_) => jest.fn()),
}));

jest.useFakeTimers();

const user1 = {
  access_token: "myAccessToken1",
  profile: { user: "author-id" },
};

const project = {
  name: "hello world",
  identifier: "hello-world-project",
  user_id: "author-id",
  components: [{ name: "main", extension: "py", content: "# hello" }],
};

const initialComponents = project.components.map((component) => ({
  ...component,
}));

const editedProject = {
  ...project,
  components: [{ ...project.components[0], content: "# hello edited" }],
};

const saveAction = { type: "SAVE_PROJECT" };
const saveProject = jest.fn(() => saveAction);

const createLifecycle = ({
  context = {},
  scheduler = { queued: false, inFlight: false, lastCompletedAt: null },
} = {}) => {
  const schedulerState = { ...scheduler };
  const inFlightSavePromiseRef = { current: null };
  const pendingSaveWaitersRef = { current: [] };
  const throttleTimerRef = { current: null };

  let resolveSave;
  let rejectSave;
  const dispatch = jest.fn(() => {
    return new Promise((resolve, reject) => {
      resolveSave = resolve;
      rejectSave = reject;
    });
  });

  const baseContext = {
    enabled: true,
    saving: "idle",
    codeRunInProgress: false,
    project: editedProject,
    user: user1,
    initialComponents,
    initialProjectName: project.name,
    initialProjectInstructions: null,
    reactAppApiEndpoint: "http://example.com",
    ...context,
  };

  const lifecycle = createAutoSaveLifecycle({
    dispatch,
    getContext: () => baseContext,
    getScheduler: () => schedulerState,
    inFlightSavePromiseRef,
    pendingSaveWaitersRef,
    throttleTimerRef,
  });

  return {
    lifecycle,
    schedulerState,
    dispatch,
    baseContext,
    resolveSave: () => resolveSave(saveAction),
    rejectSave: () => rejectSave(new Error("save failed")),
    pendingSaveWaitersRef,
  };
};

beforeEach(() => {
  syncProject.mockImplementation(jest.fn((_) => saveProject));
});

describe("autoSaveLifecycle", () => {
  test("requestAutoSave does not save when project is unchanged", () => {
    const { lifecycle, dispatch } = createLifecycle({
      context: { project },
    });

    lifecycle.requestAutoSave();

    expect(dispatch).not.toHaveBeenCalled();
  });

  test("requestAutoSave saves when project has changed", async () => {
    const { lifecycle, dispatch, resolveSave } = createLifecycle();

    lifecycle.requestAutoSave();

    expect(saveProject).toHaveBeenCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });

    await resolveSave();
    await Promise.resolve();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  test("requestAutoSave queues when redux saving is pending", () => {
    const { lifecycle, dispatch, schedulerState } = createLifecycle({
      context: { saving: "pending" },
    });

    lifecycle.requestAutoSave();

    expect(dispatch).not.toHaveBeenCalled();
    expect(schedulerState.queued).toBe(true);
  });

  test("requestAutoSave queues during throttle after a successful save", async () => {
    const { lifecycle, dispatch, resolveSave } = createLifecycle();

    lifecycle.requestAutoSave();
    await resolveSave();
    await Promise.resolve();

    lifecycle.requestAutoSave();
    expect(dispatch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(10000);
    await Promise.resolve();
    await resolveSave();
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  test("resolveSaveWaiters resumes flushPendingAutoSave waiting on redux save", async () => {
    const { lifecycle, dispatch, baseContext, resolveSave } = createLifecycle({
      context: { saving: "pending" },
    });

    const flushPromise = lifecycle.flushPendingAutoSave();
    await Promise.resolve();
    expect(dispatch).not.toHaveBeenCalled();

    baseContext.saving = "idle";
    lifecycle.resolveSaveWaiters();
    await Promise.resolve();
    await Promise.resolve();
    await resolveSave();
    await flushPromise;

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  test("hasPendingAutoSave is false when disabled", () => {
    const { lifecycle } = createLifecycle({
      context: { enabled: false },
      scheduler: { queued: true, inFlight: false, lastCompletedAt: null },
    });

    expect(lifecycle.hasPendingAutoSave()).toBe(false);
  });

  test("flushPendingAutoSave rejects when save fails", async () => {
    const { lifecycle, rejectSave } = createLifecycle();

    const flushPromise = lifecycle.flushPendingAutoSave();
    await Promise.resolve();
    rejectSave();

    await expect(flushPromise).rejects.toThrow("autosave failed");
  });
});
