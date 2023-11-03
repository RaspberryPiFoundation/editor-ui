import React from "react";
import { render, renderHook, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { useProjectPersistence } from "./useProjectPersistence";
import { Provider } from "react-redux";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  setProject,
} from "../redux/EditorSlice";
import { defaultPythonProject } from "../utils/defaultProjects";
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

jest.mock("../utils/Notifications", () => ({
  ...jest.requireActual("../utils/Notifications"),
  showLoginPrompt: jest.fn(),
  showSavePrompt: jest.fn(),
}));

jest.useFakeTimers();

const user1 = {
  access_token: "myAccessToken",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const user2 = {
  access_token: "myAccessToken",
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

describe("When not logged in and just loaded", () => {
  beforeEach(() => {
    renderHook(() => useProjectPersistence({ user: null, justLoaded: true }));
    jest.runAllTimers();
  });

  test("Expires justLoaded", async () => {
    expect(expireJustLoaded).toHaveBeenCalled();
  });
});

describe("When not logged in and not just loaded", () => {
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

describe("When not logged in and has been prompted to login to save", () => {
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

describe("When logged in and user does not own project and just loaded", () => {
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

  test("Expires justLoaded", async () => {
    expect(expireJustLoaded).toHaveBeenCalled();
  });
});

describe("When logged in and user does not own project and not just loaded", () => {
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

  test("Save prompt shown", async () => {
    expect(showSavePrompt).toHaveBeenCalled();
  });

  test("Dispatches save prompt shown action", async () => {
    expect(setHasShownSavePrompt).toHaveBeenCalled();
  });

  test("Project saved in localStorage", async () => {
    expect(localStorage.getItem("hello-world-project")).toEqual(
      JSON.stringify(project),
    );
  });
});

describe("When logged in and user does not own project and prompted to save", () => {
  let mockedStore;

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

  test("Save prompt not shown again", async () => {
    expect(showSavePrompt).not.toHaveBeenCalled();
  });

  test("Project saved in localStorage", async () => {
    expect(localStorage.getItem("hello-world-project")).toEqual(
      JSON.stringify(project),
    );
  });
});

// describe("When logged in and user does not own project and awaiting save", () => {
//   let mockedStore;
//   let remixProject;
//   let remixAction;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     localStorage.setItem("awaitingSave", "true");
//     remixAction = { type: "REMIX_PROJECT" };
//     remixProject = jest.fn(() => remixAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Project remixed and saved to database", async () => {
//     expectedActions.push(remixAction);
//     await waitFor(
//       () =>
//         expect(remixProject).toHaveBeenCalledWith({
//           project,
//           accessToken: user2.access_token,
//         }),
//       { timeout: 2100 },
//     );
//     expect(mockedStore.getActions()).toEqual(expectedActions);
//   });
// });

// describe("When logged in and project has no identifier and awaiting save", () => {
//   let mockedStore;
//   let saveProject;
//   let saveAction;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: { ...project, identifier: null },
//         loading: "success",
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     localStorage.setItem("awaitingSave", "true");
//     saveAction = { type: "SAVE_PROJECT" };
//     saveProject = jest.fn(() => saveAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Project saved to database", async () => {
//     expectedActions.push(saveAction);
//     await waitFor(
//       () =>
//         expect(saveProject).toHaveBeenCalledWith({
//           project: { ...project, identifier: null },
//           accessToken: user2.access_token,
//           autosave: false,
//         }),
//       { timeout: 2100 },
//     );
//     expect(mockedStore.getActions()).toEqual(expectedActions);
//   });
// });

// describe("When logged in and user owns project", () => {
//   let mockedStore;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user1,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   test("Project autosaved to database", async () => {
//     const saveAction = { type: "SAVE_PROJECT" };
//     const saveProject = jest.fn(() => saveAction);
//     expectedActions.push(saveAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
//     await waitFor(
//       () =>
//         expect(saveProject).toHaveBeenCalledWith({
//           project,
//           accessToken: user1.access_token,
//           autosave: true,
//         }),
//       { timeout: 2100 },
//     );
//     expect(mockedStore.getActions()).toEqual(expectedActions);
//   });
// });
