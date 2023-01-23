import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import DeleteProjectModal from "./DeleteProjectModal";
import { syncProject } from "../Editor/EditorSlice";

jest.mock('../Editor/EditorSlice', () => ({
  ...jest.requireActual('../Editor/EditorSlice'),
  syncProject: jest.fn((_) => jest.fn())
}))

describe("Testing the delete project modal", () => {
  let store;
  let deleteButton;
  let user = { access_token: 'my_access_token' }
  let project = { identifier: 'project-to-delete', name: 'my first project' }

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        modals: {
          deleteProject: project
        },
        deleteProjectModalShowing: true
      },
      auth: {user}
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id='app'><DeleteProjectModal currentName='main' currentExtension='py' fileKey={0} /></div></Provider>)
    deleteButton = screen.getByText('projectList.deleteProjectModal.delete')
  })

  test('Modal renders', () => {
    expect(screen.queryByText('projectList.deleteProjectModal.heading')).toBeInTheDocument()
  })

  test('Clicking close button dispatches close modal action', () => {
    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)
    expect(store.getActions()).toEqual([{type: 'editor/closeDeleteProjectModal'}])
  })

  test('Clicking cancel button closes modal and does not save', () => {
    const cancelButton = screen.queryByText('projectList.deleteProjectModal.cancel')
    fireEvent.click(cancelButton)
    expect(store.getActions()).toEqual([{type: 'editor/closeDeleteProjectModal'}])
  })

  test("Clicking delete button deletes the project", async () => {
      const deleteAction = {type: 'DELETE_PROJECT' }
      const deleteProject = jest.fn(() => deleteAction)
      syncProject.mockImplementationOnce(jest.fn((_) => (deleteProject)))
      fireEvent.click(deleteButton)
      await waitFor(() => expect(deleteProject).toHaveBeenCalledWith({ identifier: 'project-to-delete', accessToken: user.access_token }))
      expect(store.getActions()[0]).toEqual(deleteAction)
  })
})
