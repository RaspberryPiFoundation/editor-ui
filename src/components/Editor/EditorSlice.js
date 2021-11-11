import { createSlice } from '@reduxjs/toolkit'

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: [],
    projectLoaded: false,
    error: "",
  },
  reducers: {
    setProject: (state, action) => {
      state.project = action.payload;
    },
    setProjectLoaded: (state, action) => {
      state.projectLoaded = action.payload;
    },
    updateProject: (state, action) => {
      const lang = action.payload.lang;
      const fileName = action.payload.name;
      const code = action.payload.code;

      const mapped = state.project.components.map(item => {
        if (item.lang !== lang || item.name !== fileName) {
          return item;
        }

        return { ...item, ...{ content: code } };
      })
      state.project.components = mapped;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setProject, setProjectLoaded, updateProject, setError } = EditorSlice.actions

export default EditorSlice.reducer
