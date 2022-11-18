import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createProject, readProject, updateProject } from '../../utils/apiCallHandler';

export const loadProject = createAsyncThunk('editor/loadProjectStatus', async (projectIdentifier) => {
  console.log(`Requesting ${projectIdentifier}`)
  const response =  await readProject(projectIdentifier)
  return response.data
})

export const saveProject = createAsyncThunk('editor/saveProjectStatus', async (data) => {
  let response
  if (!data.project.identifier) {
    response = await createProject(data.project, data.user.access_token)

    // if (response.status === 200) {
    //   const identifier = response.data.identifier;
    //   const project_type = response.data.project_type;
    //   dispatch(setProjectLoaded(false));
    //   history.push(`/${project_type}/${identifier}`)
    //   // showSavedMessage()
    // }
  }
  else {
    console.log(data.project)
    console.log(data.user)
    response = await updateProject(data.project, data.user.access_token)

    // if(response.status === 200) {
    //   dispatch(setProject(response.data));
    //  // showSavedMessage()
    // }
  }
  return response.data
})

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    project: {},
    projectLoaded: 'idle',
    error: "",
    nameError: "",
    codeRunTriggered: false,
    drawTriggered: false,
    isEmbedded: false,
    isSplitView: true,
    codeRunStopped: false,
    projectList: [],
    projectListLoaded: false,
    saving: 'idle',
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
      state.projectLoaded='success'
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
      state.error = ''
    },
    closeRenameFileModal: (state) => {
      state.renameFileModalShowing = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(saveProject.pending, (state) => {
      state.saving = 'pending'
    })
    builder.addCase(saveProject.fulfilled, (state, action) => {
      state.saving = 'success'
      // state.project = action.payload.data;
      if (!state.project.image_list) {
        state.project.image_list = []
      }
      // state.projectLoaded=false
      // state.project = action.payload.data
    })
    builder.addCase(saveProject.rejected, (state) => {
      state.saving = 'failed'
    })
    builder.addCase(loadProject.pending, (state) => {
      state.projectLoaded = 'pending'
    })
    builder.addCase(loadProject.fulfilled, (state, action) => {
      console.log('Setting project')
      state.project = action.payload
      state.projectLoaded = 'success'
    })
    builder.addCase(loadProject.rejected, (state) => {
      state.projectLoaded = 'failed'
    })
  }
})

// Action creators are generated for each case reducer function
export const {
  addProjectComponent,
  codeRunHandled,
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
  showRenameFileModal,
  closeRenameFileModal,
} = EditorSlice.actions

export default EditorSlice.reducer
