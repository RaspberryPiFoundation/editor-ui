import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from "./Header";
import { syncProject, showLoginToSaveModal } from "../Editor/EditorSlice";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

jest.mock('../Editor/EditorSlice', () => ({
  ...jest.requireActual('../Editor/EditorSlice'),
  syncProject: jest.fn((_) => jest.fn())
}))

const project = {
  name: 'Hello world',
  identifier: "hello-world-project",
  components: [],
  image_list: [],
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
}
const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
  }
}


describe("When logged in and user owns project", () => {
  let store;
  let saveButton;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        loading: 'success',
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
    saveButton = screen.queryByText('header.save')
  })

  test("Renders project gallery link", () => {
    expect(screen.queryByText('header.projects')).not.toBeNull();
  })

  test('Project name is shown', () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument()
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test("Clicking save dispatches saveProject with correct parameters", async () => {
    const saveAction = {type: 'SAVE_PROJECT' }
    const saveProject = jest.fn(() => saveAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))
    fireEvent.click(saveButton)
    await waitFor(() => expect(saveProject).toHaveBeenCalledWith({
      project,
      accessToken: user.access_token,
      autosave: false
    }))
    expect(store.getActions()[0]).toEqual(saveAction)
  })
})

describe("When logged in and no project identifier", () => {
  let store;
  const project_without_id = { ...project, identifier: null }

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project_without_id,
        loading: 'success',
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test('Project name is shown', () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument()
   })

   test("Clicking save dispatches saveProject with correct parameters", async () => {
    const saveAction = {type: 'SAVE_PROJECT' }
    const saveProject = jest.fn(() => saveAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))
    const saveButton = screen.getByText('header.save')
    fireEvent.click(saveButton)
    await waitFor(() => expect(saveProject).toHaveBeenCalledWith({
      project: project_without_id,
      accessToken: user.access_token,
      autosave: false
    }))
    expect(store.getActions()[0]).toEqual(saveAction)
  })
})

describe("When logged in and user does not own project", () => {
  const another_project = { ...project, user_id: '5254370e-26d2-4c8a-9526-8dbafea43aa9'}
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: another_project,
        loading: 'success',
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test("Clicking save dispatches remixProject with correct parameters", async () => {
    const remixAction = {type: 'REMIX_PROJECT' }
    const remixProject = jest.fn(() => (remixAction))
    syncProject.mockImplementationOnce(jest.fn((_) => remixProject))
    const saveButton = screen.getByText('header.save')
    fireEvent.click(saveButton)
    await waitFor(() => expect(remixProject).toHaveBeenCalledWith({
      project: another_project,
      accessToken: user.access_token
    }))
    expect(store.getActions()[0]).toEqual(remixAction)
  })
})

describe("When not logged in", () => {
  let store

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: project,
          loading: 'success',
        },
        auth: {
          user: null
        }
      }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test("No project gallery link", () => {
    expect(screen.queryByText('header.projects')).toBeNull();
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test('Project name is shown', () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument()
  })

  test('Clicking save opens login to save modal', () => {
    const saveButton = screen.getByText('header.save')
    fireEvent.click(saveButton)
    expect(store.getActions()).toEqual([showLoginToSaveModal()])
  })
})

describe('When no project loaded', () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {},
          loading: 'idle',
        },
        auth: {
          user: user
        }
      }
    const store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test('No project name', () => {
    expect(screen.queryByText(project.name)).not.toBeInTheDocument()
  })

  test('No download button', () => {
    expect(screen.queryByText('header.download')).not.toBeInTheDocument()
  })

  test('No save button', () => {
    expect(screen.queryByText('header.save')).not.toBeInTheDocument()
  })
})
