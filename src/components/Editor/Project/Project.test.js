import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Project from "./Project";
import { closeFile, expireJustLoaded, setHasShownSavePrompt, syncProject } from "../EditorSlice";
import { showLoginPrompt, showSavedMessage, showSavePrompt } from "../../../utils/Notifications";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

jest.mock('../EditorSlice', () => ({
  ...jest.requireActual('../EditorSlice'),
  syncProject: jest.fn((_) => jest.fn())
}))

jest.mock('../../../utils/Notifications')

jest.useFakeTimers()

window.HTMLElement.prototype.scrollIntoView = jest.fn()

const user1 = {
  access_token: 'myAccessToken',
  profile: {
    user: 'b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf'
  }
}

const user2 = {
  access_token: 'myAccessToken',
  profile: {
    user: 'cd8a5b3d-f7bb-425e-908f-1386decd6bb1'
  }
}

const project = {
  name: 'hello world',
    project_type: 'python',
    identifier: 'hello-world-project',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ],
    user_id: user1.profile.user
}

test("Renders with file menu if not for web component", () => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: []
        },
        openFiles: []
      },
      auth: {}
    }
    const store = mockStore(initialState);
  const {queryByText} = render(<Provider store={store}><div id="app"><Project/></div></Provider>)
  expect(queryByText('filePane.files')).not.toBeNull()
})

test("Renders without file menu if for web component", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      project: {
        components: []
      },
      openFiles: []
    },
    auth: {}
  }
  const store = mockStore(initialState);
  const {queryByText} = render(<Provider store={store}><Project forWebComponent={true}/></Provider>)
  expect(queryByText('filePane.files')).toBeNull()
})

describe('opening and closing different files', () => {
  let store

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: 'main',
              extension: 'py',
              content: 'print("hello")'
            },
            {
              name: 'a',
              extension: 'py',
              content: '# Your code here'
            }
          ]
        },
        openFiles: ['main.py', 'a.py'],
        focussedFileIndex: 1
      },
      auth: {
        user: null
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id="app"><Project/></div></Provider>)
  })

  test("Renders content of focussed file", () => {
    expect(screen.queryByText('# Your code here')).toBeInTheDocument()
  })

  test("Scrolls focussed file into view", () => {
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  test('Clicking the file close button dispatches close action', () => {
    const closeButton = screen.queryAllByRole('button')[3]
    fireEvent.click(closeButton)
    expect(store.getActions()).toEqual([closeFile('a.py')])
  })
})

describe('When not logged in and just loaded', () => {
  let mockedStore

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        loading: 'success',
        justLoaded: true,
        openFiles: []
      },
      auth: {}
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved in localStorage', async () => {
    await waitFor(() => expect(localStorage.getItem('hello-world-project')).toEqual(JSON.stringify(project)), {timeout: 2100})
  })
  test('Expires justLoaded', async () => {
    await waitFor(() => expect(mockedStore.getActions()).toEqual([expireJustLoaded()]), {timeout: 2100})
  })
})

describe('When not logged in and not just loaded', () => {
  let mockedStore

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        loading: 'success',
        justLoaded: false,
        openFiles: []
      },
      auth: {}
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Login prompt shown', async () => {
    await waitFor(() => expect(showLoginPrompt).toHaveBeenCalled(), {timeout: 2100})
  })

  test('Dispatches save prompt shown action', async () => {
    await waitFor(() => expect(mockedStore.getActions()).toEqual([setHasShownSavePrompt()]), {timeout: 2100})
  })
})

describe('When not logged in and has been prompted to login to save', () => {
  let mockedStore

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        loading: 'success',
        justLoaded: false,
        hasShownSavePrompt: true,
        openFiles: []
      },
      auth: {}
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Login prompt shown', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(showLoginPrompt).not.toHaveBeenCalled(), {timeout: 2100})
  })
})

describe('When logged in and user does not own project and just loaded', () => {
  let mockedStore

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project,
        loading: 'success',
        justLoaded: true,
        openFiles: []
      },
      auth: {
        user: user2
      }
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved in localStorage', async () => {
    await waitFor(() => expect(localStorage.getItem('hello-world-project')).toEqual(JSON.stringify(project)), {timeout: 2100})
  })
  test('Expires justLoaded', async () => {
    await waitFor(() => expect(mockedStore.getActions()).toEqual([expireJustLoaded()]), {timeout: 2100})
  })
})

describe('When logged in and user does not own project and not just loaded', () => {
  let mockedStore

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project,
        loading: 'success',
        justLoaded: false,
        openFiles: []
      },
      auth: {
        user: user2
      }
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Save prompt shown', async () => {
    await waitFor(() => expect(showSavePrompt).toHaveBeenCalled(), {timeout: 2100})
  })
  test('Dispatches save prompt shown action', async () => {
    await waitFor(() => expect(mockedStore.getActions()).toEqual([setHasShownSavePrompt()]), {timeout: 2100})
  })
})

describe('When logged in and user does not own project and prompted to save', () => {
  let mockedStore

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project,
        loading: 'success',
        justLoaded: false,
        hasShownSavePrompt: true,
        openFiles: []
      },
      auth: {
        user: user2
      }
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Save prompt not shown again', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(showSavePrompt).not.toHaveBeenCalled(), {timeout: 2100})
  })
})

describe('When logged in and user owns project', () => {

  let mockedStore;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project,
        loading: 'success',
        openFiles: []
      },
      auth: {
        user: user1
      }
    }
    mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
  })

  test('Project autosaved to database', async () => {
    const saveAction = {type: 'SAVE_PROJECT' }
    const saveProject = jest.fn(() => saveAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))
    await waitFor(() => expect(saveProject).toHaveBeenCalledWith({project, accessToken: user1.access_token, autosave: true}), {timeout: 2100})
    expect(mockedStore.getActions()[0]).toEqual(saveAction)
  })
})

test('Successful manual save prompts project saved message', async () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: []
        },
        openFiles: [],
        saving: 'success',
        lastSaveAutosave: false
      },
      auth: {}
    }
    const mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><div id="app"><Project/></div></Provider>);
    await waitFor(() => expect(showSavedMessage).toHaveBeenCalled())
})

// TODO: Write test for successful autosave not prompting the project saved message as per the above
