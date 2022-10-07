import { createSlice } from '@reduxjs/toolkit'

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: {},
    projectLoaded: false,
    error: "",
    nameError: "",
    codeRunTriggered: false,
    drawTriggered: false,
    isEmbedded: false,
    codeRunStopped: false,
    projectList: [],
    projectListLoaded: false,
    senseHatAlwaysEnabled: false,
    senseHatEnabled: false,
    renameFileModalShowing: false,
    modals: {},
  },
  reducers: {
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
    setNameError: (state, action) => {
      state.nameError = action.payload;
    },
    setProject: (state, action) => {
      state.project = action.payload;
      if (!state.project.image_list) {
        state.project.image_list = []
      }
    },
    setProjectLoaded: (state, action) => {
      state.projectLoaded = action.payload;
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
    showRenameFileModal: (state, action) => {
      state.modals.renameFile = action.payload
      state.renameFileModalShowing = true
    }
  },
})

// Action creators are generated for each case reducer function
export const {
  addProjectComponent,
  codeRunHandled,
  setEmbedded,
  setError,
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
  showRenameFileModal,
} = EditorSlice.actions

export default EditorSlice.reducer
