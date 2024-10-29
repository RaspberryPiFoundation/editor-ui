import { renderHook } from "@testing-library/react";
import { useProjectPersistence } from "./useProjectPersistence";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../redux/EditorSlice";
import { showLoginPrompt, showSavePrompt } from "../utils/Notifications";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
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

afterEach(() => {
  localStorage.clear();
});

describe("When not logged in", () => {
  describe("When just loaded", () => {
    beforeEach(() => {
      renderHook(() => useProjectPersistence({ user: null, justLoaded: true }));
      jest.runAllTimers();
    });

    test("Expires justLoaded", () => {
      expect(expireJustLoaded).toHaveBeenCalled();
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

  describe("When save has been triggered", () => {
    beforeEach(() => {
      renderHook(() =>
        useProjectPersistence({
          user: null,
          project: project,
          saveTriggered: true,
        }),
      );
      jest.runAllTimers();
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

    describe("When project has identifier and awaiting save", () => {
      beforeEach(() => {
        localStorage.setItem("awaitingSave", "true");
        syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
        syncProject.mockImplementationOnce(jest.fn((_) => loadProject));
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: project,
          }),
        );
        jest.runAllTimers();
      });

      test("Project remixed and saved to database", () => {
        expect(remixProject).toHaveBeenCalledWith({
          project,
          accessToken: user2.access_token,
        });
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

    describe("When project has no identifier and awaiting save", () => {
      beforeEach(() => {
        localStorage.setItem("awaitingSave", "true");
        syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
        renderHook(() =>
          useProjectPersistence({
            user: user2,
            project: { ...project, identifier: null },
          }),
        );
        jest.runAllTimers();
      });

      test("Project saved to database", () => {
        expect(saveProject).toHaveBeenCalledWith({
          project: { ...project, identifier: null },
          accessToken: user2.access_token,
          autosave: false,
        });
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

  describe("When user owns project", () => {
    beforeEach(() => {
      syncProject.mockImplementation(jest.fn((_) => saveProject));
    });

    test("Project autosaved to database if save not triggered", async () => {
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
  });
});
