import { createSlice } from '@reduxjs/toolkit'

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: [],
    projectLoaded: false,
    error: "",
    codeRunTriggered: false,
    drawTriggered: false,
    isEmbedded: false,
    codeRunStopped: false,
  },
  reducers: {
    setEmbedded: (state, _action) => {
      state.isEmbedded = true;
    },
    setProject: (state, action) => {
      state.project = action.payload;
    },
    setProjectLoaded: (state, action) => {
      state.projectLoaded = action.payload;
    },
    triggerDraw: (state) => {
      state.drawTriggered = true;
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
  },
})

// Action creators are generated for each case reducer function
export const {
  setEmbedded,
  setProject,
  setProjectLoaded,
  triggerDraw,
  updateProject,
  setError,
  triggerCodeRun,
  stopCodeRun,
  stopDraw,
  codeRunHandled,
} = EditorSlice.actions

export default EditorSlice.reducer
