import { createSlice } from '@reduxjs/toolkit'

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: [],
    projectLoaded: false,
    error: "",
    codeRunTriggered: false,
  },
  reducers: {
    setProject: (state, action) => {
      state.project = action.payload;
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
export const { setProject,
  setProjectLoaded,
  updateProject,
  setError,
  triggerCodeRun,
  stopCodeRun,
  codeRunHandled,
} = EditorSlice.actions

export default EditorSlice.reducer
