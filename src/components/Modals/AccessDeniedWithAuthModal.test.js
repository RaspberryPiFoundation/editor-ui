import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AccessDeniedWithAuthModal from "./AccessDeniedWithAuthModal";
import { syncProject } from "../Editor/EditorSlice";
import { defaultPythonProject } from "../../utils/defaultProjects";

jest.mock('../Editor/EditorSlice', () => ({
  ...jest.requireActual('../Editor/EditorSlice'),
  syncProject: jest.fn((_) => jest.fn())
}))

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
  }
}

const middlewares = []
const mockStore = configureStore(middlewares)

describe('When accessDeniedWithAuthModalShowing is true', () => {
  let store

  beforeEach(() => {
    const initialState = {
      editor: {
        accessDeniedWithAuthModalShowing: true,
      },
      auth: {
        user: user
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id='app'><AccessDeniedWithAuthModal /></div></Provider>)
  })

  test('Modal rendered', () => {
    expect(screen.queryByText('project.accessDeniedWithAuthModal.heading')).toBeInTheDocument()
  })

  test('Clicking close button dispatches close modal action', () => {
    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)
    expect(store.getActions()).toEqual([{type: 'editor/closeAccessDeniedWithAuthModal'}])
  })

  test('Clicking new project creates a new project', async () => {
    const newProjectLink = screen.queryByText('project.accessDeniedWithAuthModal.newProject')
    const saveAction = {type: 'SAVE_PROJECT' }
    const saveProject = jest.fn(() => saveAction)
    syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))
    fireEvent.click(newProjectLink)
    await waitFor(() => expect(saveProject).toHaveBeenCalledWith({
      project: defaultPythonProject,
      accessToken: user.access_token,
      autosave: false
    }))
    expect(store.getActions()[0]).toEqual(saveAction)
  })
})

describe('When accessDeniedNoAuthModalShowing is false', () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        accessDeniedNoAuthModalShowing: false
      },
      auth: {
        user: {
          accessToken: 'myAccessToken'
        }
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><div id='app'><AccessDeniedWithAuthModal /></div></Provider>)
  })

  test('Modal not rendered', () => {
    expect(screen.queryByText('project.accessDeniedWithAuthModal.heading')).not.toBeInTheDocument()
  })
})
