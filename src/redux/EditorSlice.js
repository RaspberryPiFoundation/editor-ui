import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import parseLinkHeader from "parse-link-header";
import {
  loadProjectPending,
  loadProjectFulfilled,
  loadProjectRejected,
} from "./reducers/loadProjectReducers";
import ApiCallHandler from "../utils/apiCallHandler";

export const syncProject = (actionName) =>
  createAsyncThunk(
    `editor/${actionName}Project`,
    async (
      {
        reactAppApiEndpoint,
        project,
        identifier,
        locale,
        accessToken,
        autosave,
        assetsOnly,
      },
      { rejectWithValue },
    ) => {
      const {
        createOrUpdateProject,
        readProject,
        loadRemix,
        createRemix,
        deleteProject,
        loadAssets,
      } = ApiCallHandler({ reactAppApiEndpoint });

      let response;
      switch (actionName) {
        case "load":
          if (assetsOnly) {
            response = await loadAssets(identifier, locale, accessToken);
          } else {
            response = await readProject(identifier, locale, accessToken);
          }
          break;
        case "loadRemix":
          response = await loadRemix(identifier, accessToken);
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
  async ({ reactAppApiEndpoint, page, accessToken }) => {
    const { readProjectList } = ApiCallHandler({
      reactAppApiEndpoint,
    });
    const response = await readProjectList(page, accessToken);
    return {
      projects: response.data,
      page,
      links: parseLinkHeader(response.headers.link),
    };
  },
);

export const editorInitialState = {
  project: {},
  cascadeUpdate: false,
  readOnly: false,
  saveTriggered: false,
  saving: "idle",
  loading: "idle",
  justLoaded: false,
  remixLoadFailed: false,
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
  isOutputOnly: false,
  browserPreview: false,
  isSplitView: true,
  isThemeable: true,
  webComponent: false,
  activeRunner: null,
  loadedRunner: null,
  codeRunLoading: false,
  codeRunStopped: false,
  projectList: [],
  projectListLoaded: "idle",
  lastSaveAutosave: false,
  lastSavedTime: null,
  senseHatAlwaysEnabled: false,
  senseHatEnabled: false,
  loadRemixDisabled: false,
  betaModalShowing: false,
  errorModalShowing: false,
  newFileModalShowing: false,
  renameFileModalShowing: false,
  sidebarShowing: true,
  modals: {},
  errorDetails: {},
  errorLine: "",
  errorLineNumber: null,
  runnerBeingLoaded: null | "pyodide" | "skulpt",
};

export const EditorSlice = createSlice({
  name: "editor",
  initialState: editorInitialState,
  reducers: {
    resetState: () => editorInitialState,
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
    setWebComponent: (state, action) => {
      state.webComponent = action.payload;
    },
    addProjectComponent: (state, action) => {
      state.project.components.push({
        name: action.payload.name,
        extension: action.payload.extension,
        content: action.payload.content || "",
      });
      state.saving = "idle";
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setEmbedded: (state, _action) => {
      state.isEmbedded = true;
    },
    setIsOutputOnly: (state, action) => {
      state.isOutputOnly = action.payload;
    },
    setBrowserPreview: (state, _action) => {
      state.browserPreview = true;
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
      state.openFiles = [[]];
      const firstPanelIndex = 0;
      if (state.project.project_type === "html") {
        state.openFiles[firstPanelIndex].push("index.html");
      } else {
        state.openFiles[firstPanelIndex].push("main.py");
      }
      state.justLoaded = true;
    },
    setProjectInstructions: (state, action) => {
      state.project.instructions = action.payload;
    },
    expireJustLoaded: (state) => {
      state.justLoaded = false;
    },
    setReadOnly: (state, action) => {
      state.readOnly = action.payload;
    },
    setInstructionsEditable: (state, action) => {
      state.instructionsEditable = action.payload;
    },
    setSenseHatAlwaysEnabled: (state, action) => {
      state.senseHatAlwaysEnabled = action.payload;
    },
    setSenseHatEnabled: (state, action) => {
      state.senseHatEnabled = action.payload;
    },
    setLoadRemixDisabled: (state, action) => {
      state.loadRemixDisabled = action.payload;
    },
    setReactAppApiEndpoint: (state, action) => {
      state.reactAppApiEndpoint = action.payload;
    },
    triggerDraw: (state) => {
      state.drawTriggered = true;
    },
    triggerSave: (state) => {
      state.saveTriggered = true;
    },
    updateProjectComponent: (state, action) => {
      const {
        extension,
        name: fileName,
        content,
        cascadeUpdate,
      } = action.payload;

      const mapped = state.project.components.map((item) => {
        if (item.extension !== extension || item.name !== fileName) {
          return item;
        }

        return { ...item, ...{ content } };
      });
      state.project.components = mapped;
      state.cascadeUpdate = cascadeUpdate;
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
    setCascadeUpdate: (state, action) => {
      state.cascadeUpdate = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setErrorLine: (state, action) => {
      state.errorLine = action.payload;
    },
    setErrorLineNumber: (state, action) => {
      state.errorLineNumber = action.payload;
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
    loadingRunner: (state, action) => {
      state.runnerBeingLoaded = action.payload;
      state.activeRunner = action.payload;
      state.codeRunLoading = true;
    },
    setLoadedRunner: (state, action) => {
      if (state.runnerBeingLoaded === action.payload) {
        state.loadedRunner = action.payload;
        state.codeRunLoading = false;
      }
    },
    resetRunner: (state) => {
      state.activeRunner = null;
      state.loadedRunner = null;
      state.codeRunLoading = true;
    },
    codeRunHandled: (state) => {
      state.codeRunLoading = false;
      state.codeRunTriggered = false;
      state.codeRunStopped = false;
      state.runnerBeingLoaded = null;
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
    showSidebar: (state) => {
      state.sidebarShowing = true;
    },
    hideSidebar: (state) => {
      state.sidebarShowing = false;
    },
    disableTheming: (state) => {
      state.isThemeable = false;
    },
    setErrorDetails: (state, action) => {
      state.errorDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("editor/saveProject/pending", (state) => {
      state.saving = "pending";
      state.saveTriggered = false;
    });
    builder.addCase("editor/saveProject/fulfilled", (state, action) => {
      localStorage.removeItem(state.project.identifier || "project");
      state.lastSaveAutosave = action.payload.autosave;
      state.saving = "success";
      state.lastSavedTime = Date.now();

      if (state.project.identifier !== action.payload.project.identifier) {
        state.project.image_list = state.project.image_list || [];
        state.project = action.payload.project;
        state.loading = "idle";
      }
    });
    builder.addCase("editor/saveProject/rejected", (state) => {
      state.saving = "failed";
    });
    builder.addCase("editor/remixProject/pending", (state, action) => {
      state.saving = "pending";
      state.saveTriggered = false;
    });
    builder.addCase("editor/remixProject/fulfilled", (state, action) => {
      localStorage.removeItem(state.project.identifier);
      state.lastSaveAutosave = false;
      state.saving = "success";
      state.project = action.payload.project;
      state.loading = "idle";
    });
    builder.addCase("editor/loadRemixProject/pending", loadProjectPending);
    builder.addCase("editor/loadRemixProject/fulfilled", (state, action) => {
      loadProjectFulfilled(state, action);
      state.remixLoadFailed = false;
    });
    builder.addCase("editor/loadRemixProject/rejected", (state, action) => {
      loadProjectRejected(state, action);
      state.remixLoadFailed = true;
    });
    builder.addCase("editor/loadProject/pending", loadProjectPending);
    builder.addCase("editor/loadProject/fulfilled", loadProjectFulfilled);
    builder.addCase("editor/loadProject/rejected", loadProjectRejected);
    builder.addCase("editor/deleteProject/fulfilled", (state) => {
      state.projectListLoaded = "idle";
      state.modals.deleteProject = null;
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  resetState,
  addProjectComponent,
  loadingRunner,
  setLoadedRunner,
  resetRunner,
  codeRunHandled,
  expireJustLoaded,
  closeFile,
  openFile,
  setOpenFiles,
  addFilePanel,
  setFocussedFileIndex,
  setPage,
  setEmbedded,
  setIsOutputOnly,
  setBrowserPreview,
  setCascadeUpdate,
  setError,
  setErrorLine,
  setErrorLineNumber,
  setIsSplitView,
  setNameError,
  setHasShownSavePrompt,
  setWebComponent,
  setProject,
  setProjectInstructions,
  setReadOnly,
  setInstructionsEditable,
  setSenseHatAlwaysEnabled,
  setSenseHatEnabled,
  setLoadRemixDisabled,
  setReactAppApiEndpoint,
  stopCodeRun,
  stopDraw,
  triggerCodeRun,
  triggerDraw,
  triggerSave,
  updateComponentName,
  updateImages,
  updateProjectComponent,
  updateProjectName,
  showBetaModal,
  closeBetaModal,
  showErrorModal,
  closeErrorModal,
  showNewFileModal,
  closeNewFileModal,
  showRenameFileModal,
  closeRenameFileModal,
  showSidebar,
  hideSidebar,
  disableTheming,
  setErrorDetails,
} = EditorSlice.actions;

export default EditorSlice.reducer;
