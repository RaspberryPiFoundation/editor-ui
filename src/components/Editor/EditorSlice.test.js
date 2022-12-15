import { createOrUpdateProject, createRemix, readProject } from '../../utils/apiCallHandler';

import reducer, {
  syncProject,
  stopCodeRun,
  showRenameFileModal,
  closeRenameFileModal,
} from "./EditorSlice";

jest.mock('../../utils/apiCallHandler')

test("Action stopCodeRun sets codeRunStopped to true", () => {
  const previousState = {
    codeRunTriggered: true,
    codeRunStopped: false
  };
  const expectedState = {
    codeRunTriggered: true,
    codeRunStopped: true
  }
  expect(reducer(previousState, stopCodeRun())).toEqual(expectedState)
})

test("Showing modal sets file state and showing status", () => {
  const previousState = {
    renameFileModalShowing: false,
    modals: {},
    error: 'some error'
  }
  const expectedState = {
    renameFileModalShowing: true,
    modals: {
      renameFile: {
        name: 'main',
        ext: '.py',
        fileKey: 0
      }
    },
    error: ''
  }
  expect(reducer(previousState, showRenameFileModal({name: 'main', ext: '.py', fileKey: 0}))).toEqual(expectedState)
})

test("closing modal updates showing status", () => {
  const previousState = {
    renameFileModalShowing: true,
    modals: {
      renameFile: {
        name: 'main',
        ext: '.py',
        fileKey: 0
      }
    }
  }
  const expectedState = {
    renameFileModalShowing: false,
    modals: {
      renameFile: {
        name: 'main',
        ext: '.py',
        fileKey: 0
      }
    }
  }
  expect(reducer(previousState, closeRenameFileModal())).toEqual(expectedState)
})

describe('When project has no identifier', () => {
  const dispatch = jest.fn()
  const project = {
    name: 'hello world',
    project_type: 'python',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ]
  }
  const access_token = 'myToken'

  const initialState = {
    editor: {
      project: project,
      saving: 'idle',
    },
    auth: {
      isLoadingUser: false
    }
  }

  let saveThunk
  let saveAction

  beforeEach(() => {
    Date.now = jest.fn(() => 1669808953)
    saveThunk= syncProject('save')
    saveAction = saveThunk({ project, accessToken: access_token, autosave: false })
  })

  test('Saving creates new project', async () => {
    await saveAction(dispatch, () => initialState)
    expect(createOrUpdateProject).toHaveBeenCalledWith(project, access_token)
  })

  test('Successfully creating project triggers fulfilled action', async () => {
    createOrUpdateProject.mockImplementationOnce(() => Promise.resolve({ status: 200 }))
    await saveAction(dispatch, () => initialState)
    expect(dispatch.mock.calls[1][0].type).toBe('editor/saveProject/fulfilled')
  })

  test('The saveProject/fulfilled action sets saving to success and loaded to idle', async () => {
    const returnedProject = {...project, identifier: 'auto-generated-identifier'} 
    const expectedState = {
      project: returnedProject,
      saving: 'success',
      lastSavedTime: 1669808953,
      loading: 'idle'
    }

    expect(reducer(initialState.editor, saveThunk.fulfilled({ project: returnedProject }))).toEqual(expectedState)
  })

  // TODO: Autosave state testing

})

describe('When project has an identifier', () => {
  const dispatch = jest.fn()
  const project = {
    name: 'hello world',
    project_type: 'python',
    identifier: 'my-project-identifier',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ],
    image_list: []
  }
  const access_token = 'myToken'
  const initialState = {
    editor: {
      project: project,
      saving: 'idle'
    },
    auth: {
      isLoadingUser: false
    }
  }

  let saveThunk
  let saveAction

  let remixThunk
  let remixAction

  beforeEach(() => {
    saveThunk= syncProject('save')
    saveAction = saveThunk({ project, accessToken: access_token, autosave: false })
    remixThunk = syncProject('remix')
    remixAction = remixThunk({ project, accessToken: access_token })
  })

  test('Saving updates existing project', async () => {
    await saveAction(dispatch, () => initialState)
    expect(createOrUpdateProject).toHaveBeenCalledWith(project, access_token)
  })

  test('Successfully updating project triggers fulfilled action', async () => {
    createOrUpdateProject.mockImplementationOnce(() => Promise.resolve({ status: 200 }))
    await saveAction(dispatch, () => initialState)
    expect(dispatch.mock.calls[1][0].type).toBe('editor/saveProject/fulfilled')
  })

  test('The saveProject/fulfilled action sets saving to success', async () => {
    const expectedState = {
      project: project,
      saving: 'success'
    }

    expect(reducer(initialState.editor, saveThunk.fulfilled({ project }))).toEqual(expectedState)
  })

  test('Remixing triggers createRemix API call', async () => {
    await remixAction(dispatch, () => initialState)
    expect(createRemix).toHaveBeenCalledWith(project, access_token)
  })

  test('Successfully remixing project triggers fulfilled action', async () => {
    createRemix.mockImplementationOnce(() => Promise.resolve({ status: 200 }))
    await remixAction(dispatch, () => initialState)
    expect(dispatch.mock.calls[1][0].type).toBe('editor/remixProject/fulfilled')
  })

  test('The remixProject/fulfilled action sets saving, loading and lastSaveAutosave', async () => {
    const expectedState = {
      project: project,
      saving: 'success',
      loading: 'idle',
      lastSaveAutosave: false
    }

    expect(reducer(initialState.editor, remixThunk.fulfilled({ project }))).toEqual(expectedState)
  })
})

describe('When requesting a project', () => {
  const dispatch = jest.fn()
  const project = {
    name: 'hello world',
    project_type: 'python',
    identifier: 'my-project-identifier',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ],
    image_list: []
  }
  const initialState = {
    editor: {
      project: {},
      loading: 'idle'
    },
    auth: {
      isLoadingUser: false
    }
  }

  let loadThunk
  let loadAction
  
  let loadFulfilledAction
  let loadRejectedAction

  beforeEach(() => {
    loadThunk = syncProject('load')
    loadAction = loadThunk({ identifier: 'my-project-identifier', projectType: 'python', accessToken: 'my_token' })

    loadFulfilledAction = loadThunk.fulfilled({ project })
    loadFulfilledAction.meta.requestId='my_request_id'
    loadRejectedAction = loadThunk.rejected()
    loadRejectedAction.meta.requestId='my_request_id'
  })

  test('Reads project from database', async () => {
    await loadAction(dispatch, () => initialState)
    expect(readProject).toHaveBeenCalledWith('my-project-identifier', 'python', 'my_token')
  })

  test('If loading status pending, loading success updates status', () => {
    const initialState = {
      loading: 'pending',
      currentLoadingRequestId: 'my_request_id'
    }
    const expectedState = {
      loading: 'success',
      saving: 'idle',
      project: project,
      currentLoadingRequestId: undefined,
    }
    expect(reducer(initialState, loadFulfilledAction)).toEqual(expectedState)
  })

  test('If not latest request, loading success does not update status', () => {
    const initialState = {
      loading: 'pending',
      currentLoadingRequestId: 'another_request_id'
    }
    expect(reducer(initialState, loadFulfilledAction)).toEqual(initialState)
  })

  test('If already rejected, loading success does not update status', () => {
    const initialState = {
      loading: 'failed'
    }
    expect(reducer(initialState, syncProject('load').fulfilled())).toEqual(initialState)
  })

  test('If loading status pending, loading failure updates status', () => {
    const initialState = {
      loading: 'pending',
      currentLoadingRequestId: 'my_request_id'
    }
    const expectedState = {
      loading: 'failed',
      saving: 'idle',
      currentLoadingRequestId: undefined
    }
    expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState)
  })

  test('If not latest request, loading failure does not update status', () => {
    const initialState = {
      loading: 'pending',
      currentLoadingRequestId: 'another_request_id'
    }
    expect(reducer(initialState, loadRejectedAction)).toEqual(initialState)
  })

  test('If already fulfilled, loading rejection does not update status', () => {
    const initialState = {
      loading: 'success'
    }
    expect(reducer(initialState, loadThunk.rejected())).toEqual(initialState)
  })
})
