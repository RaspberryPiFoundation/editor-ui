import { act, renderHook } from "@testing-library/react";
import { useProjectPersistence } from "./useProjectPersistence";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../redux/EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";

let mockInitialComponents = [];
let mockInitialProjectName = undefined;
let mockInitialProjectInstructions = undefined;
let mockSaving = "idle";
let mockCodeRunInProgress = false;
let mockDispatch;

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
  expireJustLoaded: jest.fn(),
  setHasShownSavePrompt: jest.fn(),
}));

jest.mock("../utils/Notifications");

const remixAction = { type: "REMIX_PROJECT" };
const remixProject = jest.fn(() => remixAction);
const saveAction = { type: "SAVE_PROJECT" };
const saveProject = jest.fn(() => saveAction);
const loadProject = jest.fn();

jest.useFakeTimers();

const user1 = {
  access_token: "myAccessToken1",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const user2 = {
  access_token: "myAccessToken2",
  profile: {
    user: "cd8a5b3d-f7bb-425e-908f-1386decd6bb1",
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

const createAsyncThunkDispatchMock = (resolveImmediately = saveAction) =>
  jest.fn(() => {
    const thunkPromise =
      typeof resolveImmediately === "function"
        ? new Promise((resolve) => {
            resolveImmediately(resolve);
          })
        : Promise.resolve(resolveImmediately);

    thunkPromise.unwrap = () =>
      thunkPromise.then((action) => {
        if (action?.error) {
          throw action.error;
        }
        return action;
      });
    return thunkPromise;
  });

beforeEach(() => {
  mockInitialComponents = initialComponents;
  mockInitialProjectName = project.name;
  mockInitialProjectInstructions = project.instructions ?? null;
  mockSaving = "idle";
  mockCodeRunInProgress = false;
  mockDispatch = createAsyncThunkDispatchMock();
});

afterEach(() => {
  mockInitialComponents = [];
  mockInitialProjectName = undefined;
  mockInitialProjectInstructions = undefined;
  mockSaving = "idle";
  mockCodeRunInProgress = false;
  localStorage.clear();
});

describe("When not logged in", () => {
  describe("When just loaded", () => {
    beforeEach(() => {
      renderHook(() =>
        useProjectPersistence({
          user: null,
          project,
          justLoaded: true,
        }),
      );
      jest.runAllTimers();
    });

    test("Expires justLoaded", () => {
      expect(expireJustLoaded).toHaveBeenCalled();
    });

    test("Project not saved in localStorage", () => {
      expect(localStorage.getItem("hello-world-project")).toBeNull();
    });
  });

  describe("When not just loaded", () => {
    beforeEach(() => {
      renderHook(() =>
        useProjectPersistence({
          user: null,
          project: project,
          justLoaded: false,
        }),
      );
      jest.runAllTimers();
    });

    test("Login prompt shown", () => {
      expect(showLoginPrompt).toHaveBeenCalled();
    });

    test("Dispatches save prompt shown action", () => {
      expect(setHasShownSavePrompt).toHaveBeenCalled();
    });

    test("Project saved in localStorage", () => {
      expect(localStorage.getItem("hello-world-project")).toEqual(
        JSON.stringify(project),
      );
    });
  });

  describe("When has been prompted to login to save", () => {
    beforeEach(() => {
      renderHook(() =>
        useProjectPersistence({
          user: null,
          project: project,
          justLoaded: false,
          hasShownSavePrompt: true,
        }),
      );
      jest.runAllTimers();
    });

    test("Login prompt shown", () => {
      expect(showLoginPrompt).not.toHaveBeenCalled();
    });

    test("Project saved in localStorage", () => {
      expect(localStorage.getItem("hello-world-project")).toEqual(
        JSON.stringify(project),
      );
    });
  });
});

describe("When logged in", () => {
  describe("When user does not own project", () => {
    describe("When just loaded", () => {
      beforeEach(() => {
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: project,
            justLoaded: true,
          }),
        );
        jest.runAllTimers();
      });

      test("Expires justLoaded", () => {
        expect(expireJustLoaded).toHaveBeenCalled();
      });

      test("Project not saved in localStorage", () => {
        expect(localStorage.getItem("hello-world-project")).toBeNull();
      });
    });

    describe("When just loaded and project has changed", () => {
      beforeEach(() => {
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: editedProject,
            justLoaded: true,
          }),
        );
        jest.runAllTimers();
      });

      test("Expires justLoaded", () => {
        expect(expireJustLoaded).toHaveBeenCalled();
      });

      test("Project saved in localStorage", () => {
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(editedProject),
        );
      });
    });

    describe("When not just loaded", () => {
      beforeEach(() => {
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: project,
            justLoaded: false,
          }),
        );
        jest.runAllTimers();
      });

      test("Save prompt shown", () => {
        expect(showSavePrompt).toHaveBeenCalled();
      });

      test("Dispatches save prompt shown action", () => {
        expect(setHasShownSavePrompt).toHaveBeenCalled();
      });

      test("Project saved in localStorage", () => {
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(project),
        );
      });
    });

    describe("When user has been prompted to save", () => {
      beforeEach(() => {
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: project,
            justLoaded: false,
            hasShownSavePrompt: true,
          }),
        );
        jest.runAllTimers();
      });

      test("Save prompt not shown again", () => {
        expect(showSavePrompt).not.toHaveBeenCalled();
      });

      test("Project saved in localStorage", () => {
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(project),
        );
      });
    });

    describe("When project has identifier and save triggered", () => {
      beforeEach(() => {
        syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
        syncProject.mockImplementationOnce(jest.fn((_) => loadProject));

        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: project,
            saveTriggered: true,
          }),
        );
        jest.runAllTimers();
      });

      test("Clicking save dispatches remixProject with correct parameters", async () => {
        await expect(remixProject).toHaveBeenCalledWith({
          project: project,
          accessToken: user2.access_token,
        });
      });

      test("loadRemix is dispatched after project is remixed", async () => {
        await remixProject();
        await expect(loadProject).toHaveBeenCalledWith({
          identifier: project.identifier,
          accessToken: user2.access_token,
        });
      });
    });

    describe("When project has identifier and save triggered without loadRemix", () => {
      beforeEach(() => {
        syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
        syncProject.mockImplementationOnce(jest.fn((_) => loadProject));

        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: project,
            saveTriggered: true,
            loadRemix: false,
          }),
        );
        jest.runAllTimers();
      });

      test("Clicking save dispatches remixProject with correct parameters", async () => {
        await expect(remixProject).toHaveBeenCalledWith({
          project: project,
          accessToken: user2.access_token,
        });
      });

      test("loadRemix is not dispatched after project is remixed", async () => {
        await remixProject();
        await expect(loadProject).not.toHaveBeenCalled();
      });
    });

    describe("When project has no identifier and save triggered", () => {
      beforeEach(() => {
        syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: { ...project, identifier: null },
            saveTriggered: true,
          }),
        );
        jest.runAllTimers();
      });

      test("Save project is called with the correct parameters", async () => {
        await expect(saveProject).toHaveBeenCalledWith({
          project: { ...project, identifier: null },
          accessToken: user2.access_token,
          autosave: false,
        });
      });
    });
  });

  describe("When user can autosave to the API", () => {
    beforeEach(() => {
      syncProject.mockImplementation(jest.fn((_) => saveProject));
    });

    test("Does not autosave unchanged project to database", () => {
      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: project,
          saveTriggered: false,
        }),
      );
      jest.runAllTimers();
      expect(saveProject).not.toHaveBeenCalled();
    });

    test("Autosaves project to database when it has changed", async () => {
      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: editedProject,
          saveTriggered: false,
        }),
      );
      jest.runAllTimers();
      expect(saveProject).toHaveBeenCalledWith({
        project: editedProject,
        accessToken: user1.access_token,
        autosave: true,
      });
    });

    test("Retries queued autosave when debounce fires during an in-flight save", async () => {
      const furtherEditedProject = {
        ...editedProject,
        components: [
          {
            ...editedProject.components[0],
            content: "# hello edited again",
          },
        ],
      };

      let resolveFirstSave;
      mockDispatch = createAsyncThunkDispatchMock((resolve) => {
        resolveFirstSave = resolve;
      });

      const { rerender } = renderHook(
        ({ project: currentProject }) =>
          useProjectPersistence({
            user: user1,
            project: currentProject,
            saveTriggered: false,
          }),
        { initialProps: { project: editedProject } },
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(saveProject).toHaveBeenCalledTimes(1);

      rerender({ project: furtherEditedProject });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(saveProject).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveFirstSave(saveAction);
        await Promise.resolve();
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(saveProject).toHaveBeenCalledTimes(2);
      expect(saveProject).toHaveBeenLastCalledWith({
        project: furtherEditedProject,
        accessToken: user1.access_token,
        autosave: true,
      });
    });

    test("Does not autosave unchanged project after load", () => {
      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: project,
          justLoaded: true,
          saveTriggered: false,
        }),
      );
      jest.runAllTimers();
      expect(saveProject).not.toHaveBeenCalled();
      expect(expireJustLoaded).toHaveBeenCalled();
    });

    test("Autosaves changed project after load once debounce elapses", () => {
      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: editedProject,
          justLoaded: true,
          saveTriggered: false,
        }),
      );
      jest.runAllTimers();
      expect(saveProject).toHaveBeenCalledWith({
        project: editedProject,
        accessToken: user1.access_token,
        autosave: true,
      });
      expect(expireJustLoaded).toHaveBeenCalled();
    });

    test("Increases save interval for large projects", async () => {
      const largeProject = {
        ...editedProject,
        components: [
          {
            name: "main",
            extension: "py",
            content: "mango".repeat(200001),
          },
        ],
      };
      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: largeProject,
          saveTriggered: false,
        }),
      );
      jest.advanceTimersByTime(2500);
      expect(saveProject).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(saveProject).toHaveBeenCalledWith({
        project: largeProject,
        accessToken: user1.access_token,
        autosave: true,
      });
    });

    test("Saves project to database if save triggered", async () => {
      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: project,
          saveTriggered: true,
        }),
      );
      jest.runAllTimers();
      expect(saveProject).toHaveBeenCalledWith({
        project,
        accessToken: user1.access_token,
        autosave: false,
      });
    });

    test("Saves project to database if awaitingSave is set", async () => {
      localStorage.setItem("awaitingSave", "true");

      renderHook(() =>
        useProjectPersistence({
          user: user1,
          project: project,
          saveTriggered: false,
        }),
      );
      jest.runAllTimers();
      expect(saveProject).toHaveBeenCalledWith({
        project,
        accessToken: user1.access_token,
        autosave: false,
      });

      localStorage.removeItem("awaitingSave");
    });
  });
});
