import reducer, {
  syncProject,
  stopCodeRun,
  showRenameFileModal,
  closeRenameFileModal,
  openFile,
  closeFile,
  setFocussedFileIndex,
  updateComponentName,
  setLoadRemixDisabled,
  setIsOutputOnly,
  setErrorDetails,
  setReadOnly,
  addProjectComponent,
  updateProjectComponent,
  setCascadeUpdate,
} from "./EditorSlice";

const mockCreateRemix = jest.fn();
const mockDeleteProject = jest.fn();
const mockLoadAssets = jest.fn();
const mockReadProject = jest.fn();
const mockCreateOrUpdateProject = jest.fn();

jest.mock("../utils/apiCallHandler", () => () => ({
  createRemix: jest.fn(mockCreateRemix),
  deleteProject: jest.fn(mockDeleteProject),
  loadAssets: jest.fn(mockLoadAssets),
  readProject: jest.fn(mockReadProject),
  createOrUpdateProject: jest.fn(mockCreateOrUpdateProject),
}));

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

test("Action setLoadRemixDisabled sets loadRemixDisabled to true", () => {
  const previousState = {
    loadRemixDisabled: false,
  };
  const expectedState = {
    loadRemixDisabled: true,
  };
  expect(reducer(previousState, setLoadRemixDisabled(true))).toEqual(
    expectedState,
  );
});

test("Action setLoadRemixDisabled sets loadRemixDisabled to false", () => {
  const previousState = {
    loadRemixDisabled: true,
  };
  const expectedState = {
    loadRemixDisabled: false,
  };
  expect(reducer(previousState, setLoadRemixDisabled(false))).toEqual(
    expectedState,
  );
});

test("Action setIsOutputOnly sets isOutputOnly to true", () => {
  const previousState = {
    isOutputOnly: false,
  };
  const expectedState = {
    isOutputOnly: true,
  };
  expect(reducer(previousState, setIsOutputOnly(true))).toEqual(expectedState);
});

test("Action setOutputOnly sets isOutputOnly to false", () => {
  const previousState = {
    isOutputOnly: true,
  };
  const expectedState = {
    isOutputOnly: false,
  };
  expect(reducer(previousState, setIsOutputOnly(false))).toEqual(expectedState);
});

test("Action setErrorDetails sets errorDetails to true", () => {
  const previousState = {
    errorDetails: {},
  };
  const expectedState = {
    errorDetails: { type: "Interrupted", message: "Some error message" },
  };
  expect(
    reducer(
      previousState,
      setErrorDetails({ type: "Interrupted", message: "Some error message" }),
    ),
  ).toEqual(expectedState);
});

test("Action setReadOnly correctly sets readOnly", () => {
  const previousState = { readOnly: false };
  const expectedState = { readOnly: true };
  expect(reducer(previousState, setReadOnly(true))).toEqual(expectedState);
});

test("Action addProjectComponent adds component to project with correct content", () => {
  const previousState = {
    project: {
      components: [],
    },
  };
  const expectedState = {
    project: {
      components: [
        {
          name: "main",
          extension: "py",
          content: "print('hello world')",
        },
      ],
    },
    saving: "idle",
  };
  expect(
    reducer(
      previousState,
      addProjectComponent({
        name: "main",
        extension: "py",
        content: "print('hello world')",
      }),
    ),
  ).toEqual(expectedState);
});

test("Action updateProjectComponent updates component in project with correct content", () => {
  const previousState = {
    project: {
      components: [
        {
          name: "main",
          extension: "py",
          content: "print('hello world')",
        },
      ],
    },
    cascadeUpdate: false,
  };
  const expectedState = {
    project: {
      components: [
        {
          name: "main",
          extension: "py",
          content: "print('hello there world!')",
        },
      ],
    },
    cascadeUpdate: true,
  };
  expect(
    reducer(
      previousState,
      updateProjectComponent({
        name: "main",
        extension: "py",
        content: "print('hello there world!')",
        cascadeUpdate: true,
      }),
    ),
  ).toEqual(expectedState);
});

test("Action setCascadeUpdate sets cascadeUpdate correctly", () => {
  const previousState = { cascadeUpdate: true };
  const expectedState = { cascadeUpdate: false };
  expect(reducer(previousState, setCascadeUpdate(false))).toEqual(
    expectedState,
  );
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
    expect(mockCreateOrUpdateProject).toHaveBeenCalledWith(
      project,
      access_token,
    );
  });

  test("Successfully creating project triggers fulfilled action", async () => {
    mockCreateOrUpdateProject.mockImplementationOnce(() =>
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
    localStorage.clear();

    saveThunk = syncProject("save");
    saveAction = saveThunk({
      project,
      accessToken: access_token,
      autosave: false,
    });
    remixThunk = syncProject("remix");
    remixAction = remixThunk({ project, accessToken: access_token });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("The saveProject/pending action sets saveTriggered to false", async () => {
    const newState = reducer(
      initialState.editor,
      saveThunk.pending({ project }),
    );
    expect(newState.saveTriggered).toBe(false);
  });

  test("Saving updates existing project", async () => {
    await saveAction(dispatch, () => initialState);
    expect(mockCreateOrUpdateProject).toHaveBeenCalledWith(
      project,
      access_token,
    );
  });

  test("Successfully updating project triggers fulfilled action", async () => {
    mockCreateOrUpdateProject.mockImplementationOnce(() =>
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

  test("The remixProject/pending action sets saveTriggered to false", async () => {
    const newState = reducer(
      initialState.editor,
      remixThunk.pending({ project }),
    );
    expect(newState.saveTriggered).toBe(false);
  });

  test("Remixing triggers createRemix API call", async () => {
    await remixAction(dispatch, () => initialState);
    expect(mockCreateRemix).toHaveBeenCalledWith(project, access_token);
  });

  test("Successfully remixing project triggers fulfilled action", async () => {
    mockCreateRemix.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
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

  test("The remixProject/fulfilled action removes original project from local storage", async () => {
    localStorage.setItem(project.identifier, JSON.stringify(project));

    const remixedProject = Object.assign({}, project);
    remixedProject.identifier = "my-remixed-project";

    reducer(
      initialState.editor,
      remixThunk.fulfilled({ project: remixedProject }),
    );

    expect(localStorage.getItem(project.identifier)).toBeNull();
  });
});

describe("When renaming a project from the rename project modal", () => {
  let project = { name: "hello world" };
  const access_token = "myToken";
  const initialState = {
    editor: {
      project: {},
      modals: { renameProject: project },
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
    expect(mockDeleteProject).toHaveBeenCalledWith(
      project.identifier,
      access_token,
    );
  });

  test("Successfully deleting project triggers fulfilled action", async () => {
    mockDeleteProject.mockImplementationOnce(() =>
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
      projectListLoaded: "idle",
    };
    expect(reducer(initialState.editor, deleteThunk.fulfilled({}))).toEqual(
      expectedState,
    );
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

describe("Loading a project", () => {
  const dispatch = jest.fn();
  const identifier = "my-project-identifier";
  const accessToken = "myToken";
  const locale = "es-LA";

  let initialState;
  let loadThunk;

  beforeEach(() => {
    initialState = { editor: {}, auth: {} };
    loadThunk = syncProject("load");
  });

  describe("when assetsOnly is false", () => {
    let loadAction;

    beforeEach(() => {
      loadAction = loadThunk({
        identifier,
        locale,
        accessToken,
        assetsOnly: false,
      });
    });

    test("readProject is called", async () => {
      await loadAction(dispatch, () => initialState);
      expect(mockReadProject).toHaveBeenCalledWith(
        identifier,
        locale,
        accessToken,
      );
    });
  });

  describe("when assetsOnly is true", () => {
    let loadAction;

    beforeEach(() => {
      loadAction = loadThunk({
        identifier,
        locale,
        accessToken,
        assetsOnly: true,
      });
    });

    test("loadAssets is called", async () => {
      await loadAction(dispatch, () => initialState);
      expect(mockLoadAssets).toHaveBeenCalledWith(
        identifier,
        locale,
        accessToken,
      );
    });
  });
});
