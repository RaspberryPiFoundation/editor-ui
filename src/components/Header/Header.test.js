import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from "./Header";
import { saveProject } from "../Editor/EditorSlice";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

jest.mock('../Editor/EditorSlice')


describe("When logged in and user owns project", () => {
  let store;
  let saveButton;
  const project = {
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

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        projectLoaded: 'success',
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
    saveButton = screen.queryByText('header.save')
  })

  test("Save button renders", () => {
      expect(saveButton).toBeInTheDocument();
  })

  test("Clicking save dispatches saveProject with correct parameters", async () => {
    const saveAction = {type: 'SAVE_PROJECT' }
    saveProject.mockImplementationOnce(() => (saveAction))
    fireEvent.click(saveButton)
    await waitFor(() => expect(saveProject).toHaveBeenCalledWith({project, user, autosave: false}))
    expect(store.getActions()[0]).toEqual(saveAction)
  })

  test("Renders project gallery link", () => {
    expect(screen.queryByText('header.projects')).not.toBeNull();
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test('Project name is shown', () => {
    expect(screen.queryByRole('textbox')).toBeInTheDocument()
  })
})

describe("When logged in and no project identifier", () => {
  let store;
  let saveButton;
  const project = {
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

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        projectLoaded: 'success',
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
    saveButton = screen.getByText('header.save')
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test("Save button is shown", () => {
    expect(saveButton).toBeInTheDocument()
  })

  test('Project name is shown', () => {
    expect(screen.queryByRole('textbox')).toBeInTheDocument()
   })
})

describe("When logged in and user does not own project", () => {
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          name: 'My first project',
          identifier: "hello-world-project",
          components: [],
          image_list: [],
          user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
        },
        projectLoaded: 'success',
      },
      auth: {
        user: {
          access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
          profile: {
            user: "5254370e-26d2-4c8a-9526-8dbafea43aa9"
          }
        }
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test("Renders project gallery link", () => {
    expect(screen.queryByText('header.projects')).not.toBeNull();
  })

  test("No save button", () => {
    expect(screen.queryByText('header.save')).toBeNull()
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test('Project name is shown', () => {
    expect(screen.queryByText('My first project')).toBeInTheDocument()
  })
})

describe("When not logged in", () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {
            identifier: "hello-world-project",
            components: [],
            image_list: [],
          },
          projectLoaded: 'success',
        },
        auth: {
          user: null
        }
      }
    const store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test("No save button", () =>{
    expect(screen.queryByText('header.save')).toBeNull();
  })

  test("No project gallery link", () => {
    expect(screen.queryByText('header.projects')).toBeNull();
  })

  test('Download button shown', () => {
    expect(screen.queryByText('header.download')).toBeInTheDocument()
  })

  test('Project name is shown', () => {
    expect(screen.queryByText('header.newProject')).toBeInTheDocument()
  })
})

describe('When no project loaded', () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {},
          projectLoaded: 'idle',
        },
        auth: {
          user: "5254370e-26d2-4c8a-9526-8dbafea43aa9"
        }
      }
    const store = mockStore(initialState);
    render(<Provider store={store}><Header/></Provider>);
  })

  test('No project name', () => {
    expect(screen.queryByText('header.newProject')).not.toBeInTheDocument()
  })

  test('No download button', () => {
    expect(screen.queryByText('header.download')).not.toBeInTheDocument()
  })

  test('No save button', () => {
    expect(screen.queryByText('header.save')).not.toBeInTheDocument()
  })
})
