import React from "react";
import { render, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { Project, PROJECT_QUERY } from "./Project";
import { expireJustLoaded, setHasShownSavePrompt, syncProject } from "../EditorSlice";
import { showLoginPrompt, showSavedMessage, showSavePrompt } from "../../../utils/Notifications";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('../EditorSlice', () => ({
  ...jest.requireActual('../EditorSlice'),
  syncProject: jest.fn((_) => jest.fn())
}))

jest.mock('../../../utils/Notifications')

jest.useFakeTimers()

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

const graphqlMocks = [
  {
    request: {
      query: PROJECT_QUERY,
      variables: { identifier: project.identifier }
    },
    result: {
      data: {
        project: {
          __typename: "Project",
          id: "Graphql project ID",
          name: project.name,
        },
      },
    }
  }
]


test("Renders with file menu", () => {
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
  const {queryByText} = render(<MockedProvider><Provider store={store}><div id="app"><Project/></div></Provider></MockedProvider>)
  expect(queryByText('filePane.files')).not.toBeNull()
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved in localStorage', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(localStorage.getItem('hello-world-project')).toEqual(JSON.stringify(project)))
  })

  test('Expires justLoaded', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(mockedStore.getActions()).toEqual([expireJustLoaded()]))
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Login prompt shown', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(showLoginPrompt).toHaveBeenCalled(), {timeout: 2100})
  })

  test('Dispatches save prompt shown action', async () => {
    jest.runAllTimers()
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved in localStorage', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(localStorage.getItem('hello-world-project')).toEqual(JSON.stringify(project)), {timeout: 2100})
  })

  test('Expires justLoaded', async () => {
    jest.runAllTimers()
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Save prompt shown', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(showSavePrompt).toHaveBeenCalled(), {timeout: 2100})
  })

  test('Dispatches save prompt shown action', async () => {
    jest.runAllTimers()
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Save prompt not shown again', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(showSavePrompt).not.toHaveBeenCalled(), {timeout: 2100})
  })
})

describe('When logged in and user does not own project and awaiting save', () => {
  let mockedStore
  let remixProject
  let remixAction

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
        user: user2
      }
    }
    mockedStore = mockStore(initialState);
    localStorage.setItem('awaitingSave', 'true')
    remixAction = {type: 'REMIX_PROJECT' }
    remixProject = jest.fn(() => remixAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (remixProject)))
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project remixed and saved to database', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(remixProject).toHaveBeenCalledWith({project, accessToken: user2.access_token}), {timeout: 2100})
    expect(mockedStore.getActions()[0]).toEqual(remixAction)
  })
})

describe('When logged in and project has no identifier and awaiting save', () => {
  let mockedStore
  let saveProject
  let saveAction

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {...project, identifier: null},
        loading: 'success',
        openFiles: []
      },
      auth: {
        user: user2
      }
    }
    mockedStore = mockStore(initialState);
    localStorage.setItem('awaitingSave', 'true')
    saveAction = {type: 'SAVE_PROJECT' }
    saveProject = jest.fn(() => saveAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))
    render(<MemoryRouter><MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider></MemoryRouter>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved to database', async () => {
    jest.runAllTimers()
    await waitFor(() => expect(saveProject).toHaveBeenCalledWith({project: {...project, identifier: null}, accessToken: user2.access_token, autosave: false}), {timeout: 2100})
    expect(mockedStore.getActions()[0]).toEqual(saveAction)
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
  })

  test('Project autosaved to database', async () => {
    const saveAction = {type: 'SAVE_PROJECT' }
    const saveProject = jest.fn(() => saveAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))
    jest.runAllTimers()
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
    render(<MockedProvider mocks={graphqlMocks} addTypename={true}><Provider store={mockedStore}><div id="app"><Project/></div></Provider></MockedProvider>);
    jest.runAllTimers()
    await waitFor(() => expect(showSavedMessage).toHaveBeenCalled())
})

// TODO: Write test for successful autosave not prompting the project saved message as per the above
