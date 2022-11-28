import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event";
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ProjectName from "./ProjectName";
import { remixProject } from "../Editor/EditorSlice";

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

jest.mock('../Editor/EditorSlice', () => {
  const actual = jest.requireActual('../Editor/EditorSlice')
  return {
    ...actual,
    remixProject: jest.fn()
  }
})

describe("When logged in and user owns project", () => {
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          name: "Hello world",
          user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
        },
      },
      auth: {
        user: {
          access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
          profile: {
            user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
          }
        }
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><ProjectName/></Provider>);
  })

  test("Name renders in input box", () => {
    expect(screen.queryByRole('textbox', {value: "Hello world"})).not.toBeNull()
  })

  test("Typing in the input box dispatches project update", () => {
    const textBox = screen.getByRole('textbox');
    fireEvent.click(textBox)
    userEvent.type(textBox, '!')
    const expectedActions = [{type: 'editor/updateProjectName', payload: 'Hello world!'}]
    expect(store.getActions()).toEqual(expectedActions);
  })

  test("No remix button", () => {
    expect(screen.queryByTitle('Remix')).toBeNull();
  })
})

describe("When logged in and user does not own project", () => {
  let store;
  const project = {
    identifier: "hello-world-project",
    name: 'Hello world',
    user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
  }
  const user = {
    access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
    profile: {
      user: "5254370e-26d2-4c8a-9526-8dbafea43aa9"
    }
  }

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><ProjectName/></Provider>);
  })

  test("Name renders", () => {
    expect(screen.queryByText(/Hello world/)).not.toBeNull()
  })

  test("Remix button renders", () => {
    expect(screen.queryByTitle('Remix')).not.toBeNull();
  })

  test("Clicking remix button dispatches remixProject with correct parameters", async () => {
    const remixAction = {type: 'REMIX_PROJECT' }
    remixProject.mockImplementationOnce(() => (remixAction))
    const remixButton = screen.getByTitle("Remix").parentElement
    fireEvent.click(remixButton)
    await waitFor(() => expect(remixProject).toHaveBeenCalledWith({project, user}))
    expect(store.getActions()[0]).toEqual(remixAction)
  })
})

describe("When not logged in", () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {
            name: "Hello world",
            identifier: "hello-world-project",
          },
        },
        auth: {
          user: null
        }
      }
    const store = mockStore(initialState);
    render(<Provider store={store}><ProjectName/></Provider>);
  })

  test("Name renders", () => {
    expect(screen.queryByText(/Hello world/)).not.toBeNull()
  })

  test("No remix button", () => {
    expect(screen.queryByTitle('Remix')).toBeNull();
  })
})

describe("When project has no identifier", () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {
            name: 'Untitled project'
          },
        },
        auth: {}
      }
    const store = mockStore(initialState);
    render(<Provider store={store}><ProjectName/></Provider>);
  })

  test("Renders title as Untitled project", () => {
    expect(screen.queryByText('Untitled project')).not.toBeNull()
  })
})
