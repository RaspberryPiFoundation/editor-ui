import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createOrUpdateProject, readProject, createRemix } from '../../utils/apiCallHandler';

export const syncProject = (actionName) => createAsyncThunk(
  `editor/${actionName}Project`,
  async({ project, identifier, accessToken, autosave }, { rejectWithValue }) => {
    let response
    switch(actionName) {
      case 'load':
        response = await readProject(identifier, accessToken)
        break
      case 'remix':
        response = await createRemix(project, accessToken)
        break
      case 'save':
        response = await createOrUpdateProject(project, accessToken)
        break
      default:
        rejectWithValue({ error: 'no such sync action' })
    }
    return { project: response.data, autosave }
  },
  {
    condition: ({ autosave }, { getState }) => {
      const { editor, auth } = getState()
      const saveStatus = editor.saving
      const loadStatus = editor.loading
      if (auth.isLoadingUser) {
        return false
      }
      if ((actionName === 'save' && autosave && !editor.autosaveEnabled)) {
        return false
      }
      if ((actionName === 'save' || actionName === 'remix') && saveStatus === 'pending') {
        return false
      }
      if (actionName === 'load' && loadStatus === 'pending' ) {
        return false
      }
    },
  }
)

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: {},
    saving: 'idle',
    loading: 'idle',
    loadError: "",
    saveError: "",
    currentLoadingRequestId: undefined,
    openFiles: [],
    focussedFileIndex: 0,
    nameError: "",
    codeRunTriggered: false,
    drawTriggered: false,
    isEmbedded: false,
    isSplitView: true,
    codeRunStopped: false,
    projectList: [],
    projectListLoaded: false,
    autosaveEnabled: false,
    lastSaveAutosave: false,
    lastSavedTime: null,
    senseHatAlwaysEnabled: false,
    senseHatEnabled: false,
    betaModalShowing: false,
    loginToSaveModalShowing: false,
    renameFileModalShowing: false,
    modals: {},
  },
  reducers: {
    closeFile: (state, action) => {
      state.openFiles = state.openFiles.filter(fileName => fileName!==action.payload)
    },
    openFile: (state, action) => {
      if (!state.openFiles.includes(action.payload)) {
        state.openFiles.push(action.payload)
      }
      state.focussedFileIndex = state.openFiles.indexOf(action.payload)
    },
    setFocussedFileIndex: (state, action) => {
      state.focussedFileIndex = action.payload
    },
    updateImages: (state, action) => {
      if (!state.project.image_list) {state.project.image_list=[]}
      state.project.image_list = action.payload
    },
    addProjectComponent: (state, action) => {
      const count = state.project.components.length;
      state.project.components.push({"name": action.payload.name, "extension": action.payload.extension, "content": '', index: count})
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
    setProject: (state, action) => {
      state.project = action.payload;
      if (!state.project.image_list) {
        state.project.image_list = []
      }
      state.loading='success'
      if (state.openFiles.length === 0) {
        state.openFiles.push('main.py')
      }
    },
    setProjectLoaded: (state, action) => {
      state.loading = action.payload;
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

      const mapped = state.project.components.map(item => {
        if (item.extension !== extension || item.name !== fileName) {
          return item;
        }

        return { ...item, ...{ content: code } };
      })

      if (state.project.identifier) {
        state.autosaveEnabled = true;
      }
      state.project.components = mapped;
    },
    updateProjectName: (state, action) => {
      state.project.name = action.payload;
    },
    updateComponentName: (state, action) => {
      const key = action.payload.key;
      const name = action.payload.name;
      const extension = action.payload.extension
      state.project.components[key].name = name;
      state.project.components[key].extension = extension;
    },
    enableAutosave: (state) => {
      state.autosaveEnabled = true;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    triggerCodeRun: (state) => {
      state.codeRunTriggered = true;
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
    setProjectList: (state, action) => {
      state.projectList = action.payload;
    },
    setProjectListLoaded: (state, action) => {
      state.projectListLoaded = action.payload;
    },
    showBetaModal: (state) => {
      state.betaModalShowing = true
    },
    closeBetaModal: (state) => {
      state.betaModalShowing = false
    },
    showLoginToSaveModal: (state) => {
      state.loginToSaveModalShowing = true
    },
    closeLoginToSaveModal: (state) => {
      state.loginToSaveModalShowing = false
    },
    showRenameFileModal: (state, action) => {
      state.modals.renameFile = action.payload
      state.renameFileModalShowing = true
      state.error = ''
    },
    closeRenameFileModal: (state) => {
      state.renameFileModalShowing = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase('editor/saveProject/pending', (state) => {
      state.saving = 'pending'
    })
    builder.addCase('editor/saveProject/fulfilled', (state, action) => {
      localStorage.removeItem(state.project.identifier || 'project')
      state.lastSaveAutosave = action.payload.autosave
      state.saving = 'success'
      state.lastSavedTime = Date.now()
      state.project.image_list = state.project.image_list || []

      if (state.project.identifier !== action.payload.project.identifier) {
        state.project = action.payload.project
        state.loading = 'idle'
      }
    })
    builder.addCase('editor/saveProject/rejected', (state) => {
      state.saving = 'failed'
    })
    builder.addCase('editor/remixProject/fulfilled', (state, action) => {
      state.lastSaveAutosave = false
      state.saving = 'success'
      state.project = action.payload.project
      state.loading = 'idle'
    })
    builder.addCase('editor/loadProject/pending', (state, action) => {
      state.loading = 'pending'
      state.currentLoadingRequestId = action.meta.requestId
    })
    builder.addCase('editor/loadProject/fulfilled', (state, action) => {
      if (state.loading === 'pending' && state.currentLoadingRequestId === action.meta.requestId) {
        state.project = action.payload.project
        state.loading = 'success'
        state.saving = 'idle'
        state.currentLoadingRequestId = undefined
        if (state.openFiles.length === 0) {
          state.openFiles.push('main.py')
        }
      }
    })
    builder.addCase('editor/loadProject/rejected', (state, action) => {
      if (state.loading === 'pending' && state.currentLoadingRequestId === action.meta.requestId) {
        state.loading = 'failed'
        state.saving = 'idle'
        state.currentLoadingRequestId = undefined
      }
    })
  }
})

// Action creators are generated for each case reducer function
export const {
  addProjectComponent,
  codeRunHandled,
  enableAutosave,
  closeFile,
  openFile,
  setFocussedFileIndex,
  setEmbedded,
  setError,
  setIsSplitView,
  setNameError,
  setProject,
  setProjectList,
  setProjectListLoaded,
  setProjectLoaded,
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
  showBetaModal,
  closeBetaModal,
  showLoginToSaveModal,
  closeLoginToSaveModal,
  showRenameFileModal,
  closeRenameFileModal,
} = EditorSlice.actions

export default EditorSlice.reducer
