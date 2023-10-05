import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import parseLinkHeader from "parse-link-header";
import {
  loadProjectPending,
  loadProjectFulfilled,
  loadProjectRejected,
} from "./reducers/loadProject/loadProjectReducers";
import {
  createOrUpdateProject,
  readProject,
  createRemix,
  deleteProject,
  readProjectList,
} from "../../utils/apiCallHandler";

export const syncProject = (actionName) =>
  createAsyncThunk(
    `editor/${actionName}Project`,
    async (
      { project, identifier, locale, accessToken, autosave },
      { rejectWithValue },
    ) => {
      let response;
      switch (actionName) {
        case "load":
          response = await readProject(identifier, locale, accessToken);
          break;
        case "remix":
          response = await createRemix(project, accessToken);
          break;
        case "save":
          response = await createOrUpdateProject(project, accessToken);
          break;
        case "delete":
          response = await deleteProject(identifier, accessToken);
          break;
        default:
          rejectWithValue({ error: "no such sync action" });
      }
      return { project: response.data, autosave };
    },
    {
      condition: (_, { getState }) => {
        const { editor, auth } = getState();
        const saveStatus = editor.saving;
        const loadStatus = editor.loading;
        if (auth.isLoadingUser) {
          return false;
        }
        if (
          (actionName === "save" || actionName === "remix") &&
          saveStatus === "pending"
        ) {
          return false;
        }
        if (actionName === "load" && loadStatus === "pending") {
          return false;
        }
      },
    },
  );

export const loadProjectList = createAsyncThunk(
  `editor/loadProjectList`,
  async ({ page, accessToken }) => {
    const response = await readProjectList(page, accessToken);
    return {
      projects: response.data,
      page,
      links: parseLinkHeader(response.headers.link),
    };
  },
);

export const EditorSlice = createSlice({
  name: "editor",
  initialState: {
    project: {},
    saving: "idle",
    loading: "idle",
    justLoaded: false,
    hasShownSavePrompt: false,
    loadError: "",
    saveError: "",
    currentLoadingRequestId: undefined,
    openFiles: [[]],
    focussedFileIndices: [0],
    nameError: "",
    autorunEnabled: false,
    codeRunTriggered: false,
    codeHasBeenRun: false,
    drawTriggered: false,
    isEmbedded: false,
    isSplitView: true,
    codeRunStopped: false,
    projectList: [],
    projectListLoaded: "idle",
    projectIndexCurrentPage: 1,
    projectIndexTotalPages: 1,
    lastSaveAutosave: false,
    lastSavedTime: null,
    senseHatAlwaysEnabled: false,
    senseHatEnabled: false,
    accessDeniedNoAuthModalShowing: false,
    accessDeniedWithAuthModalShowing: false,
    betaModalShowing: false,
    errorModalShowing: false,
    loginToSaveModalShowing: false,
    notFoundModalShowing: false,
    newFileModalShowing: false,
    renameFileModalShowing: false,
    newProjectModalShowing: false,
    renameProjectModalShowing: false,
    deleteProjectModalShowing: false,
    sidebarShowing: false,
    modals: {},
  },
  reducers: {
    closeFile: (state, action) => {
      const panelIndex = state.openFiles
        .map((fileNames) => fileNames.includes(action.payload))
        .indexOf(true);
      const closedFileIndex = state.openFiles[panelIndex].indexOf(
        action.payload,
      );
      state.openFiles[panelIndex] = state.openFiles[panelIndex].filter(
        (fileName) => fileName !== action.payload,
      );
      if (
        state.focussedFileIndices[panelIndex] >=
          state.openFiles[panelIndex].length ||
        closedFileIndex < state.focussedFileIndices[panelIndex]
      ) {
        state.focussedFileIndices[panelIndex]--;
      }
    },
    openFile: (state, action) => {
      const firstPanelIndex = 0;
      if (!state.openFiles.flat().includes(action.payload)) {
        state.openFiles[firstPanelIndex].push(action.payload);
      }
      state.focussedFileIndices[firstPanelIndex] = state.openFiles[
        firstPanelIndex
      ].indexOf(action.payload);
    },
    setOpenFiles: (state, action) => {
      state.openFiles = action.payload;
    },
    addFilePanel: (state) => {
      state.openFiles.push([]);
      state.focussedFileIndices.push(0);
    },
    setFocussedFileIndex: (state, action) => {
      state.focussedFileIndices[action.payload.panelIndex] =
        action.payload.fileIndex;
    },
    updateImages: (state, action) => {
      if (!state.project.image_list) {
        state.project.image_list = [];
      }
      state.project.image_list = action.payload;
    },
    addProjectComponent: (state, action) => {
      state.project.components.push({
        name: action.payload.name,
        extension: action.payload.extension,
        content: "",
      });
      state.saving = "idle";
    },
    setEmbedded: (state, _action) => {
      state.isEmbedded = true;
    },
    setIsSplitView: (state, action) => {
      state.isSplitView = action.payload;
    },
    setNameError: (state, action) => {
      state.nameError = action.payload;
    },
    setHasShownSavePrompt: (state) => {
      state.hasShownSavePrompt = true;
    },
    setProject: (state, action) => {
      state.project = action.payload;
      if (!state.project.image_list) {
        state.project.image_list = [];
      }
      state.loading = "success";
      if (state.openFiles.flat().length === 0) {
        const firstPanelIndex = 0;
        if (state.project.project_type === "html") {
          state.openFiles[firstPanelIndex].push("index.html");
        } else {
          state.openFiles[firstPanelIndex].push("main.py");
        }
      }
      state.justLoaded = true;
    },
    expireJustLoaded: (state) => {
      state.justLoaded = false;
    },
    setSenseHatAlwaysEnabled: (state, action) => {
      state.senseHatAlwaysEnabled = action.payload;
    },
    setSenseHatEnabled: (state, action) => {
      state.senseHatEnabled = action.payload;
    },
    triggerDraw: (state) => {
      state.drawTriggered = true;
    },
    updateProjectComponent: (state, action) => {
      const extension = action.payload.extension;
      const fileName = action.payload.name;
      const code = action.payload.code;

      const mapped = state.project.components.map((item) => {
        if (item.extension !== extension || item.name !== fileName) {
          return item;
        }

        return { ...item, ...{ content: code } };
      });
      state.project.components = mapped;
    },
    updateProjectName: (state, action) => {
      state.project.name = action.payload;
      state.saving = "idle";
    },
    updateComponentName: (state, action) => {
      const key = action.payload.key;
      const name = action.payload.name;
      const extension = action.payload.extension;
      const oldName = `${state.project.components[key].name}.${state.project.components[key].extension}`;
      state.project.components[key].name = name;
      state.project.components[key].extension = extension;
      if (state.openFiles.flat().includes(oldName)) {
        const panelIndex = state.openFiles
          .map((fileNames) => fileNames.includes(oldName))
          .indexOf(true);
        const fileIndex = state.openFiles[panelIndex].indexOf(oldName);
        state.openFiles[panelIndex][fileIndex] = `${name}.${extension}`;
      }
      state.saving = "idle";
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    triggerCodeRun: (state) => {
      state.codeRunTriggered = true;
      state.codeHasBeenRun = true;
    },
    stopCodeRun: (state) => {
      state.codeRunStopped = true;
    },
    stopDraw: (state) => {
      state.drawTriggered = false;
    },
    codeRunHandled: (state) => {
      state.codeRunTriggered = false;
      state.codeRunStopped = false;
    },
    closeAccessDeniedNoAuthModal: (state) => {
      state.accessDeniedNoAuthModalShowing = false;
      state.modals = {};
    },
    closeAccessDeniedWithAuthModal: (state) => {
      state.accessDeniedWithAuthModalShowing = false;
    },
    showBetaModal: (state) => {
      state.betaModalShowing = true;
    },
    closeBetaModal: (state) => {
      state.betaModalShowing = false;
    },
    showErrorModal: (state) => {
      state.errorModalShowing = true;
    },
    closeErrorModal: (state) => {
      state.errorModalShowing = false;
    },
    showLoginToSaveModal: (state) => {
      state.loginToSaveModalShowing = true;
    },
    closeLoginToSaveModal: (state) => {
      state.loginToSaveModalShowing = false;
    },
    closeNotFoundModal: (state) => {
      state.notFoundModalShowing = false;
    },
    showNewFileModal: (state) => {
      state.newFileModalShowing = true;
    },
    closeNewFileModal: (state) => {
      state.newFileModalShowing = false;
      state.nameError = "";
    },
    showRenameFileModal: (state, action) => {
      state.modals.renameFile = action.payload;
      state.renameFileModalShowing = true;
    },
    closeRenameFileModal: (state) => {
      state.renameFileModalShowing = false;
      state.nameError = "";
    },
    showNewProjectModal: (state) => {
      state.newProjectModalShowing = true;
    },
    closeNewProjectModal: (state) => {
      state.newProjectModalShowing = false;
    },
    showRenameProjectModal: (state, action) => {
      state.modals.renameProject = action.payload;
      state.renameProjectModalShowing = true;
    },
    closeRenameProjectModal: (state) => {
      state.modals.renameProject = null;
      state.renameProjectModalShowing = false;
    },
    showDeleteProjectModal: (state, action) => {
      state.modals.deleteProject = action.payload;
      state.deleteProjectModalShowing = true;
    },
    closeDeleteProjectModal: (state) => {
      state.modals.deleteProject = null;
      state.deleteProjectModalShowing = false;
    },
    setProjectIndexPage: (state, action) => {
      state.projectIndexCurrentPage = action.payload;
      state.projectListLoaded = "idle";
    },
    showSidebar: (state) => {
      state.sidebarShowing = true;
    },
    hideSidebar: (state) => {
      state.sidebarShowing = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("editor/saveProject/pending", (state) => {
      state.saving = "pending";
    });
    builder.addCase("editor/saveProject/fulfilled", (state, action) => {
      localStorage.removeItem(state.project.identifier || "project");
      state.lastSaveAutosave = action.payload.autosave;
      state.saving = "success";
      state.lastSavedTime = Date.now();

      if (state.renameProjectModalShowing) {
        state.modals.renameProject = null;
        state.renameProjectModalShowing = false;
        state.projectListLoaded = "idle";
      } else if (
        state.project.identifier !== action.payload.project.identifier
      ) {
        state.project.image_list = state.project.image_list || [];
        state.project = action.payload.project;
        state.loading = "idle";
      }
    });
    builder.addCase("editor/saveProject/rejected", (state) => {
      state.saving = "failed";
    });
    builder.addCase("editor/remixProject/fulfilled", (state, action) => {
      state.lastSaveAutosave = false;
      state.saving = "success";
      state.project = action.payload.project;
      state.loading = "idle";
    });
    builder.addCase("editor/loadProject/pending", loadProjectPending);
    builder.addCase("editor/loadProject/fulfilled", loadProjectFulfilled);
    builder.addCase("editor/loadProject/rejected", loadProjectRejected);
    builder.addCase("editor/deleteProject/fulfilled", (state) => {
      state.projectListLoaded = "idle";
      state.modals.deleteProject = null;
      state.deleteProjectModalShowing = false;
    });
    builder.addCase("editor/loadProjectList/pending", (state) => {
      state.projectListLoaded = "pending";
    });
    builder.addCase("editor/loadProjectList/fulfilled", (state, action) => {
      if (action.payload.projects.length > 0 || action.payload.page === 1) {
        state.projectListLoaded = "success";
        state.projectList = action.payload.projects;
        const links = action.payload.links;
        state.projectIndexTotalPages =
          links && links.last ? parseInt(links.last.page) : action.payload.page;
      } else {
        state.projectIndexCurrentPage = state.projectIndexCurrentPage - 1;
        state.projectListLoaded = "idle";
      }
    });
    builder.addCase("editor/loadProjectList/rejected", (state) => {
      state.projectListLoaded = "failed";
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  addProjectComponent,
  codeRunHandled,
  expireJustLoaded,
  closeFile,
  openFile,
  setOpenFiles,
  addFilePanel,
  setFocussedFileIndex,
  setEmbedded,
  setError,
  setIsSplitView,
  setNameError,
  setHasShownSavePrompt,
  setProject,
  setSenseHatAlwaysEnabled,
  setSenseHatEnabled,
  stopCodeRun,
  stopDraw,
  triggerCodeRun,
  triggerDraw,
  updateComponentName,
  updateImages,
  updateProjectComponent,
  updateProjectName,
  closeAccessDeniedNoAuthModal,
  closeAccessDeniedWithAuthModal,
  showBetaModal,
  closeBetaModal,
  showErrorModal,
  closeErrorModal,
  showLoginToSaveModal,
  closeLoginToSaveModal,
  closeNotFoundModal,
  showNewFileModal,
  closeNewFileModal,
  showRenameFileModal,
  closeRenameFileModal,
  showNewProjectModal,
  closeNewProjectModal,
  showRenameProjectModal,
  closeRenameProjectModal,
  showDeleteProjectModal,
  closeDeleteProjectModal,
  setProjectIndexPage,
  showSidebar,
  hideSidebar,
} = EditorSlice.actions;

export default EditorSlice.reducer;
