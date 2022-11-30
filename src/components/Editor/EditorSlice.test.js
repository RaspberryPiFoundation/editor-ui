import { createProject, createRemix, readProject, updateProject } from '../../utils/apiCallHandler';

import reducer, {
  loadProject,
  stopCodeRun,
  showRenameFileModal,
  closeRenameFileModal,
  saveProject,
  remixProject
} from "./EditorSlice";

jest.mock('../../utils/apiCallHandler', () => ({
  createProject: jest.fn(),
  createRemix: jest.fn(),
  readProject: jest.fn(),
  updateProject: jest.fn()
}))

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
  const user = {
    access_token: 'myToken',
    profile: {
      user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    }
  }
  const initialState = {
    project: project,
  }

  beforeEach(() => {
    Date.now = jest.fn(() => 1669808953)
  })

  test('Saving creates new project', async () => {
    const saveThunk = saveProject({project: project, user: user})
    await saveThunk(dispatch, () => initialState)
    expect(createProject).toHaveBeenCalledWith(project, user.access_token)
  })

  test('Successfully creating project triggers fulfilled action', async () => {
    createProject.mockImplementationOnce(() => Promise.resolve({ status: 200 }))
    const saveThunk = saveProject({project: project, user: user})
    await saveThunk(dispatch, () => initialState)
    expect(dispatch.mock.calls[1][0].type).toBe('editor/saveProjectStatus/fulfilled')
  })

  test('The saveProject/fulfilled action sets saving to success and loaded to idle', async () => {

    const returnedProject = {...project, identifier: 'auto-generated-identifier'} 
    const expectedState = {
      project: returnedProject,
      saving: 'success',
      lastSavedTime: 1669808953,
      projectLoaded: 'idle'
    }
    expect(reducer(initialState, saveProject.fulfilled({project: returnedProject}))).toEqual(expectedState)
  })

  test('Autosaving sets autosave state', async () => {
    const saveThunk = saveProject({project: project, user: user, autosave: true})
  })
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
  const user = {
    access_token: 'myToken',
    profile: {
      user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    }
  }
  const initialState = {
    project: project,
  }

  test('Saving updates existing project', async () => {
    const saveThunk = saveProject({project: project, user: user})
    await saveThunk(dispatch, () => initialState)
    expect(updateProject).toHaveBeenCalledWith(project, user.access_token)
  })

  test('Successfully updating project triggers fulfilled action', async () => {
    updateProject.mockImplementationOnce(() => Promise.resolve({ status: 200 }))
    const saveThunk = saveProject({project: project, user: user})
    await saveThunk(dispatch, () => initialState)
    expect(dispatch.mock.calls[1][0].type).toBe('editor/saveProjectStatus/fulfilled')
  })

  test('The saveProject/fulfilled action sets saving to success', async () => {

    const expectedState = {
      project: project,
      saving: 'success'
    }
    expect(reducer(initialState, saveProject.fulfilled({project: project}))).toEqual(expectedState)
  })

  test('Remixing triggers createRemix API call', async () => {
    const remixThunk = remixProject({project: project, user: user})
    await remixThunk(dispatch, () => initialState)
    expect(createRemix).toHaveBeenCalledWith(project, user.access_token)
  })

  test('Successfully remixing project triggers fulfilled action', async () => {
    createRemix.mockImplementationOnce(() => Promise.resolve({ status: 200 }))
    const remixThunk = remixProject({project: project, user: user})
    await remixThunk(dispatch, () => initialState)
    expect(dispatch.mock.calls[1][0].type).toBe('editor/remixProjectStatus/fulfilled')
  })

  test('The remixProject/fulfilled action sets saving, projectLoaded and lastSaveAutosaved', async () => {

    const expectedState = {
      project: project,
      saving: 'success',
      projectLoaded: 'idle',
      lastSaveAutosaved: false
    }
    expect(reducer(initialState, remixProject.fulfilled(project))).toEqual(expectedState)
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
  var fulfilledAction = loadProject.fulfilled(project)
  fulfilledAction.meta.requestId='my_request_id'

  var rejectedAction = loadProject.rejected()
  rejectedAction.meta.requestId='my_request_id'

  test('Reads project from database', async () => {
    const loadThunk = loadProject({projectIdentifier: 'my-project-identifier', accessToken: 'my_token'})
    await loadThunk(dispatch, () => {})
    expect(readProject).toHaveBeenCalledWith('my-project-identifier', 'my_token')
  })

  test('If loading status pending, loading success updates status', () => {
    const initialState = {
      projectLoaded: 'pending',
      currentLoadingRequestId: 'my_request_id'
    }
    const expectedState = {
      projectLoaded: 'success',
      project: project,
      currentLoadingRequestId: undefined
    }
    expect(reducer(initialState, fulfilledAction)).toEqual(expectedState)
  })

  test('If not latest request, loading success does not update status', () => {
    const initialState = {
      projectLoaded: 'pending',
      currentLoadingRequestId: 'another_request_id'
    }
    expect(reducer(initialState, fulfilledAction)).toEqual(initialState)
  })

  test('If already rejected, loading success does not update status', () => {
    const initialState = {
      projectLoaded: 'failed'
    }
    expect(reducer(initialState, loadProject.fulfilled())).toEqual(initialState)
  })

  test('If loading status pending, loading failure updates status', () => {
    const initialState = {
      projectLoaded: 'pending',
      currentLoadingRequestId: 'my_request_id'
    }
    const expectedState = {
      projectLoaded: 'failed',
      currentLoadingRequestId: undefined
    }
    expect(reducer(initialState, rejectedAction)).toEqual(expectedState)
  })

  test('If not latest request, loading failure does not update status', () => {
    const initialState = {
      projectLoaded: 'pending',
      currentLoadingRequestId: 'another_request_id'
    }
    expect(reducer(initialState, rejectedAction)).toEqual(initialState)
  })

  test('If already fulfilled, loading rejection does not update status', () => {
    const initialState = {
      projectLoaded: 'success'
    }
    expect(reducer(initialState, loadProject.rejected())).toEqual(initialState)
  })
})
