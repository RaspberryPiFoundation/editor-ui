import {
  createOrUpdateProject,
  createRemix,
  deleteProject,
  readProjectList,
} from "../utils/apiCallHandler";

import reducer, {
  syncProject,
  stopCodeRun,
  showRenameFileModal,
  closeRenameFileModal,
  openFile,
  closeFile,
  setFocussedFileIndex,
  updateComponentName,
  loadProjectList,
} from "./EditorSlice";

jest.mock("../utils/apiCallHandler");

test("Action stopCodeRun sets codeRunStopped to true", () => {
  const previousState = {
    codeRunTriggered: true,
    codeRunStopped: false,
  };
  const expectedState = {
    codeRunTriggered: true,
    codeRunStopped: true,
  };
  expect(reducer(previousState, stopCodeRun())).toEqual(expectedState);
});

test("Showing rename modal sets file state and showing status", () => {
  const previousState = {
    renameFileModalShowing: false,
    modals: {},
  };
  const expectedState = {
    renameFileModalShowing: true,
    modals: {
      renameFile: {
        name: "main",
        ext: ".py",
        fileKey: 0,
      },
    },
  };
  expect(
    reducer(
      previousState,
      showRenameFileModal({ name: "main", ext: ".py", fileKey: 0 }),
    ),
  ).toEqual(expectedState);
});

test("closing rename modal updates showing status", () => {
  const previousState = {
    nameError: "some error",
    renameFileModalShowing: true,
    modals: {
      renameFile: {
        name: "main",
        ext: ".py",
        fileKey: 0,
      },
    },
  };
  const expectedState = {
    nameError: "",
    renameFileModalShowing: false,
    modals: {
      renameFile: {
        name: "main",
        ext: ".py",
        fileKey: 0,
      },
    },
  };
  expect(reducer(previousState, closeRenameFileModal())).toEqual(expectedState);
});

describe("When project has no identifier", () => {
  const dispatch = jest.fn();
  const project = {
    name: "hello world",
    project_type: "python",
    components: [
      {
        name: "main",
        extension: "py",
        content: "# hello",
      },
    ],
  };
  const access_token = "myToken";

  const initialState = {
    editor: {
      project: project,
      saving: "idle",
    },
    auth: {
      isLoadingUser: false,
    },
  };

  let saveThunk;
  let saveAction;

  beforeEach(() => {
    Date.now = jest.fn(() => 1669808953);
    saveThunk = syncProject("save");
    saveAction = saveThunk({
      project,
      accessToken: access_token,
      autosave: false,
    });
  });

  test("Saving creates new project", async () => {
    await saveAction(dispatch, () => initialState);
    expect(createOrUpdateProject).toHaveBeenCalledWith(project, access_token);
  });

  test("Successfully creating project triggers fulfilled action", async () => {
    createOrUpdateProject.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    await saveAction(dispatch, () => initialState);
    expect(dispatch.mock.calls[1][0].type).toBe("editor/saveProject/fulfilled");
  });

  test("The saveProject/fulfilled action sets saving to success and loaded to idle", async () => {
    const returnedProject = {
      ...project,
      identifier: "auto-generated-identifier",
    };
    const expectedState = {
      project: returnedProject,
      saving: "success",
      lastSavedTime: 1669808953,
      loading: "idle",
    };

    expect(
      reducer(
        initialState.editor,
        saveThunk.fulfilled({ project: returnedProject }),
      ),
    ).toEqual(expectedState);
  });

  // TODO: Autosave state testing
});

describe("When project has an identifier", () => {
  const dispatch = jest.fn();
  const project = {
    name: "hello world",
    project_type: "python",
    identifier: "my-project-identifier",
    components: [
      {
        name: "main",
        extension: "py",
        content: "# hello",
      },
    ],
    image_list: [],
  };
  const access_token = "myToken";
  const initialState = {
    editor: {
      project: project,
      saving: "idle",
    },
    auth: {
      isLoadingUser: false,
    },
  };

  let saveThunk;
  let saveAction;

  let remixThunk;
  let remixAction;

  beforeEach(() => {
    saveThunk = syncProject("save");
    saveAction = saveThunk({
      project,
      accessToken: access_token,
      autosave: false,
    });
    remixThunk = syncProject("remix");
    remixAction = remixThunk({ project, accessToken: access_token });
  });

  test("Saving updates existing project", async () => {
    await saveAction(dispatch, () => initialState);
    expect(createOrUpdateProject).toHaveBeenCalledWith(project, access_token);
  });

  test("Successfully updating project triggers fulfilled action", async () => {
    createOrUpdateProject.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    await saveAction(dispatch, () => initialState);
    expect(dispatch.mock.calls[1][0].type).toBe("editor/saveProject/fulfilled");
  });

  test("The saveProject/fulfilled action sets saving to success", async () => {
    const expectedState = {
      project: project,
      saving: "success",
    };

    expect(
      reducer(initialState.editor, saveThunk.fulfilled({ project })),
    ).toEqual(expectedState);
  });

  test("Remixing triggers createRemix API call", async () => {
    await remixAction(dispatch, () => initialState);
    expect(createRemix).toHaveBeenCalledWith(project, access_token);
  });

  test("Successfully remixing project triggers fulfilled action", async () => {
    createRemix.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    await remixAction(dispatch, () => initialState);
    expect(dispatch.mock.calls[1][0].type).toBe(
      "editor/remixProject/fulfilled",
    );
  });

  test("The remixProject/fulfilled action sets saving, loading and lastSaveAutosave", async () => {
    const expectedState = {
      project: project,
      saving: "success",
      loading: "idle",
      lastSaveAutosave: false,
    };

    expect(
      reducer(initialState.editor, remixThunk.fulfilled({ project })),
    ).toEqual(expectedState);
  });
});

describe("When renaming a project from the rename project modal", () => {
  let project = { name: "hello world" };
  const access_token = "myToken";
  const initialState = {
    editor: {
      project: {},
      modals: { renameProject: project },
      renameProjectModalShowing: true,
      projectListLoaded: "success",
    },
    auth: { user: { access_token } },
  };

  let saveThunk;

  beforeEach(() => {
    saveThunk = syncProject("save");
  });

  test("The saveProject/fulfilled action closes rename project modal and reloads projects list", () => {
    const expectedState = {
      project: {},
      saving: "success",
      modals: { renameProject: null },
      renameProjectModalShowing: false,
      projectListLoaded: "idle",
    };
    expect(
      reducer(initialState.editor, saveThunk.fulfilled({ project })),
    ).toEqual(expectedState);
  });
});

describe("When deleting a project", () => {
  const dispatch = jest.fn();
  let project = { identifier: "my-amazing-project", name: "hello world" };
  const access_token = "myToken";
  const initialState = {
    editor: {
      project: {},
      modals: { deleteProject: project },
      deleteProjectModalShowing: true,
      projectListLoaded: "success",
    },
    auth: { user: { access_token } },
  };

  let deleteThunk;
  let deleteAction;

  beforeEach(() => {
    deleteThunk = syncProject("delete");
    deleteAction = deleteThunk({
      identifier: project.identifier,
      accessToken: access_token,
    });
  });

  test("Deleting a project triggers deleteProject API call", async () => {
    await deleteAction(dispatch, () => initialState);
    expect(deleteProject).toHaveBeenCalledWith(
      project.identifier,
      access_token,
    );
  });

  test("Successfully deleting project triggers fulfilled action", async () => {
    deleteProject.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    await deleteAction(dispatch, () => initialState);
    expect(dispatch.mock.calls[1][0].type).toBe(
      "editor/deleteProject/fulfilled",
    );
  });

  test("The deleteProject/fulfilled action closes delete project modal and reloads projects list", () => {
    const expectedState = {
      project: {},
      modals: { deleteProject: null },
      deleteProjectModalShowing: false,
      projectListLoaded: "idle",
    };
    expect(reducer(initialState.editor, deleteThunk.fulfilled({}))).toEqual(
      expectedState,
    );
  });
});

describe("When requesting project list", () => {
  const dispatch = jest.fn();
  const projects = [{ name: "project1" }, { name: "project2" }];
  const initialState = {
    projectList: [],
    projectListLoaded: "pending",
    projectIndexCurrentPage: 4,
  };
  let loadProjectListThunk;

  beforeEach(() => {
    loadProjectListThunk = loadProjectList({
      page: 12,
      accessToken: "access_token",
    });
  });

  test("Loading project list triggers loadProjectList API call", async () => {
    await loadProjectListThunk(dispatch, () => initialState);
    expect(readProjectList).toHaveBeenCalledWith(12, "access_token");
  });

  test("Successfully loading project list triggers fulfilled action", async () => {
    readProjectList.mockImplementationOnce(() =>
      Promise.resolve({ status: 200, headers: {} }),
    );
    await loadProjectListThunk(dispatch, () => initialState);
    expect(dispatch.mock.calls[1][0].type).toBe(
      "editor/loadProjectList/fulfilled",
    );
  });

  test("The loadProjectList/fulfilled action with projects returned sets the projectList and total pages", () => {
    const expectedState = {
      projectList: projects,
      projectListLoaded: "success",
      projectIndexCurrentPage: 4,
      projectIndexTotalPages: 12,
    };
    expect(
      reducer(
        initialState,
        loadProjectList.fulfilled({
          projects,
          page: 4,
          links: { last: { page: 12 } },
        }),
      ),
    ).toEqual(expectedState);
  });

  test("The loadProjectList/fulfilled action with no projects loads previous page", () => {
    const expectedState = {
      projectList: [],
      projectListLoaded: "idle",
      projectIndexCurrentPage: 3,
    };
    expect(
      reducer(
        initialState,
        loadProjectList.fulfilled({ projects: [], page: 4 }),
      ),
    ).toEqual(expectedState);
  });

  test("The loadProjectList/fulfilled action with no projects on page 1 sets loading to success", () => {
    const expectedState = {
      projectList: [],
      projectListLoaded: "success",
      projectIndexCurrentPage: 1,
      projectIndexTotalPages: 1,
    };
    expect(
      reducer(
        { ...initialState, projectIndexCurrentPage: 1 },
        loadProjectList.fulfilled({ projects: [], page: 1 }),
      ),
    ).toEqual(expectedState);
  });
});

describe("Opening files", () => {
  const initialState = {
    openFiles: [["main.py", "file1.py"]],
    focussedFileIndices: [0],
  };

  test("Opening unopened file adds it to openFiles and focusses that file", () => {
    const expectedState = {
      openFiles: [["main.py", "file1.py", "file2.py"]],
      focussedFileIndices: [2],
    };
    expect(reducer(initialState, openFile("file2.py"))).toEqual(expectedState);
  });

  test("Opening already open file focusses that file", () => {
    const expectedState = {
      openFiles: [["main.py", "file1.py"]],
      focussedFileIndices: [1],
    };
    expect(reducer(initialState, openFile("file1.py"))).toEqual(expectedState);
  });

  test("Switching file focus", () => {
    const expectedState = {
      openFiles: [["main.py", "file1.py"]],
      focussedFileIndices: [1],
    };
    expect(
      reducer(
        initialState,
        setFocussedFileIndex({ panelIndex: 0, fileIndex: 1 }),
      ),
    ).toEqual(expectedState);
  });
});

describe("Closing files", () => {
  test("Closing the last file when focussed transfers focus to the left", () => {
    const initialState = {
      openFiles: [["main.py", "file1.py"]],
      focussedFileIndices: [1],
    };
    const expectedState = {
      openFiles: [["main.py"]],
      focussedFileIndices: [0],
    };
    expect(reducer(initialState, closeFile("file1.py"))).toEqual(expectedState);
  });

  test("Closing not the last file when focussed does not change focus", () => {
    const initialState = {
      openFiles: [["main.py", "file1.py", "file2.py"]],
      focussedFileIndices: [1],
    };
    const expectedState = {
      openFiles: [["main.py", "file2.py"]],
      focussedFileIndices: [1],
    };
    expect(reducer(initialState, closeFile("file1.py"))).toEqual(expectedState);
  });

  test("Closing unfocussed file before file that is in focus keeps same file in focus", () => {
    const initialState = {
      openFiles: [["main.py", "file1.py", "file2.py", "file3.py"]],
      focussedFileIndices: [2],
    };
    const expectedState = {
      openFiles: [["main.py", "file2.py", "file3.py"]],
      focussedFileIndices: [1],
    };
    expect(reducer(initialState, closeFile("file1.py"))).toEqual(expectedState);
  });

  test("Closing unfocussed file after file that is in focus keeps same file in focus", () => {
    const initialState = {
      openFiles: [["main.py", "file1.py", "file2.py", "file3.py"]],
      focussedFileIndices: [1],
    };
    const expectedState = {
      openFiles: [["main.py", "file1.py", "file3.py"]],
      focussedFileIndices: [1],
    };
    expect(reducer(initialState, closeFile("file2.py"))).toEqual(expectedState);
  });
});

describe("Updating file name", () => {
  const initialState = {
    project: {
      components: [
        { name: "file", extension: "py" },
        { name: "another_file", extension: "py" },
      ],
    },
    openFiles: [["file.py"]],
  };

  test("If file is open updates name in project and openFiles and saves", () => {
    const expectedState = {
      project: {
        components: [
          { name: "my_file", extension: "py" },
          { name: "another_file", extension: "py" },
        ],
      },
      openFiles: [["my_file.py"]],
      saving: "idle",
    };
    expect(
      reducer(
        initialState,
        updateComponentName({ key: 0, name: "my_file", extension: "py" }),
      ),
    ).toEqual(expectedState);
  });

  test("If file is closed updates name in project and saves", () => {
    const expectedState = {
      project: {
        components: [
          { name: "file", extension: "py" },
          { name: "my_file", extension: "py" },
        ],
      },
      openFiles: [["file.py"]],
      saving: "idle",
    };
    expect(
      reducer(
        initialState,
        updateComponentName({ key: 1, name: "my_file", extension: "py" }),
      ),
    ).toEqual(expectedState);
  });
});
