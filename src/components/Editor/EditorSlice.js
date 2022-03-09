import { createSlice } from '@reduxjs/toolkit'

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: {},
    projectLoaded: false,
    error: "",
    nameError: "",
    codeRunTriggered: false,
    isEmbedded: false,
    codeRunStopped: false,
  },
  reducers: {
    addImage: (state, action) => {
      if (!state.project.images) {state.project.images=[]}
      state.project.images.push({"name": action.payload.name, "extension": action.payload.extension, "url": action.payload.url})
    },
    addProjectComponent: (state, action) => {
      state.project.components.push({"name": action.payload.name, "extension": action.payload.extension})
    },
    setEmbedded: (state, _action) => {
      state.isEmbedded = true;
    },
    setNameError: (state, action) => {
      state.nameError = action.payload;
    },
    setProject: (state, action) => {
      state.project = action.payload;
      if (!state.project.images) {
        state.project.images = []
      }
    },
    setProjectLoaded: (state, action) => {
      state.projectLoaded = action.payload;
    },
    updateProject: (state, action) => {
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
    updateComponentName: (state, action) => {
      const key = action.payload.key;
      const fileName = action.payload.name;
      state.project.components[key].name = fileName;
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
    codeRunHandled: (state) => {
      state.codeRunTriggered = false;
      state.codeRunStopped = false;
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  addImage,
  addProjectComponent,
  setEmbedded,
  setNameError,
  setProject,
  setProjectLoaded,
  updateProject,
  updateComponentName,
  setError,
  triggerCodeRun,
  stopCodeRun,
  codeRunHandled,
} = EditorSlice.actions

export default EditorSlice.reducer
