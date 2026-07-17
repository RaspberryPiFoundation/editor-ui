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

/** flushPendingAutoSave is async; yield so it reaches its next await. */
const awaitAsyncFlush = () => Promise.resolve();

/** Resolve the mocked dispatch and await the full startAutoSave promise chain. */
const completeInFlightSave = async ({
  inFlightSavePromiseRef,
  resolveSave,
}) => {
  const savePromise = inFlightSavePromiseRef.current;
  await resolveSave();
  await savePromise;
};

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
    const thunkPromise = new Promise((resolve) => {
      resolveSave = resolve;
      rejectSave = (error) =>
        resolve({
          type: "editor/saveProject/rejected",
          error,
        });
    });
    thunkPromise.unwrap = () =>
      thunkPromise.then((action) => {
        if (action?.error) {
          throw action.error;
        }
        return action;
      });
    return thunkPromise;
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
    inFlightSavePromiseRef,
    pendingSaveWaitersRef,
    resolveSave: () => resolveSave(saveAction),
    rejectSave: () => rejectSave(new Error("save failed")),
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
    const { lifecycle, dispatch, inFlightSavePromiseRef, resolveSave } =
      createLifecycle();

    lifecycle.requestAutoSave();

    expect(saveProject).toHaveBeenCalledWith({
      project: editedProject,
      accessToken: user1.access_token,
      autosave: true,
      reactAppApiEndpoint: "http://example.com",
    });

    await completeInFlightSave({ inFlightSavePromiseRef, resolveSave });
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
    const { lifecycle, dispatch, inFlightSavePromiseRef, resolveSave } =
      createLifecycle();

    lifecycle.requestAutoSave();
    await completeInFlightSave({ inFlightSavePromiseRef, resolveSave });

    lifecycle.requestAutoSave();
    expect(dispatch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(10000);
    expect(inFlightSavePromiseRef.current).not.toBeNull();
    await completeInFlightSave({ inFlightSavePromiseRef, resolveSave });

    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  test("resolveSaveWaiters resumes flushPendingAutoSave waiting on redux save", async () => {
    const {
      lifecycle,
      dispatch,
      baseContext,
      inFlightSavePromiseRef,
      pendingSaveWaitersRef,
      resolveSave,
    } = createLifecycle({
      context: { saving: "pending" },
    });

    const flushPromise = lifecycle.flushPendingAutoSave();
    await awaitAsyncFlush(); // flushPendingAutoSave blocked in waitForPendingSave
    expect(pendingSaveWaitersRef.current).toHaveLength(1);
    expect(dispatch).not.toHaveBeenCalled();

    baseContext.saving = "idle";
    lifecycle.resolveSaveWaiters();
    await awaitAsyncFlush(); // flush resumes after Redux save wait ends
    await awaitAsyncFlush(); // flush reaches startAutoSave
    await completeInFlightSave({ inFlightSavePromiseRef, resolveSave });
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
    const { lifecycle, inFlightSavePromiseRef, rejectSave } = createLifecycle();

    const flushPromise = lifecycle.flushPendingAutoSave();
    await awaitAsyncFlush(); // flush passes waitForInFlightSave and calls startAutoSave
    expect(inFlightSavePromiseRef.current).not.toBeNull();

    rejectSave();
    await expect(flushPromise).rejects.toThrow("autosave failed");
  });

  test("autosave retries at most once after failure", async () => {
    const {
      lifecycle,
      dispatch,
      schedulerState,
      inFlightSavePromiseRef,
      rejectSave,
    } = createLifecycle();

    lifecycle.requestAutoSave();
    expect(dispatch).toHaveBeenCalledTimes(1);

    const firstSavePromise = inFlightSavePromiseRef.current;
    rejectSave();
    await expect(firstSavePromise).rejects.toThrow("autosave failed");
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(schedulerState.autosaveRetryUsed).toBe(true);
    expect(schedulerState.queued).toBe(false);

    const retrySavePromise = inFlightSavePromiseRef.current;
    rejectSave();
    await expect(retrySavePromise).rejects.toThrow("autosave failed");
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  test("requestAutoSave after exhausted retries attempts save again", async () => {
    const {
      lifecycle,
      dispatch,
      inFlightSavePromiseRef,
      rejectSave,
      resolveSave,
    } = createLifecycle();

    lifecycle.requestAutoSave();
    const firstSavePromise = inFlightSavePromiseRef.current;
    rejectSave();
    await expect(firstSavePromise).rejects.toThrow("autosave failed");

    const retrySavePromise = inFlightSavePromiseRef.current;
    rejectSave();
    await expect(retrySavePromise).rejects.toThrow("autosave failed");
    expect(dispatch).toHaveBeenCalledTimes(2);

    lifecycle.requestAutoSave();
    expect(dispatch).toHaveBeenCalledTimes(3);

    await completeInFlightSave({ inFlightSavePromiseRef, resolveSave });
    expect(dispatch).toHaveBeenCalledTimes(3);
  });
});
