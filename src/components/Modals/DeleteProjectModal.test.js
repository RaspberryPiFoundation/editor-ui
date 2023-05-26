import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MockedProvider } from "@apollo/client/testing";

import { DeleteProjectModal, DELETE_PROJECT_MUTATION } from "./DeleteProjectModal";

describe("Testing the delete project modal", () => {
  let store;
  let mocks;
  let project = { id: 'abc', name: 'my first project' }

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        modals: {
          deleteProject: project
        },
        deleteProjectModalShowing: true
      }
    }

    mocks = [
      {
        request: {
          query: DELETE_PROJECT_MUTATION,
          variables: { id: project.id }
        },
        result:  jest.fn(() => ({
          data: {
            deleteProject: {
              id: project.id
            }
          }
        }))
      }
    ]

    store = mockStore(initialState);

    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <div id='app'>
            <DeleteProjectModal />
          </div>
        </Provider>
      </MockedProvider>
    )
  })

  test('Modal renders', () => {
    expect(screen.queryByText('projectList.deleteProjectModal.heading')).toBeInTheDocument()
  })

  test('Clicking cancel button closes modal and does not save', () => {
    const cancelButton = screen.queryByText('projectList.deleteProjectModal.cancel')
    fireEvent.click(cancelButton)
    expect(store.getActions()).toEqual([{type: 'editor/closeDeleteProjectModal'}])
  })

  test("Clicking delete button (eventually) closes the modal", async () => {
    const deleteButton = screen.getByText('projectList.deleteProjectModal.delete')
    fireEvent.click(deleteButton)
    await waitFor(() => expect(store.getActions()).toEqual([{type: 'editor/closeDeleteProjectModal'}]))
  })

  test("Clicking delete button calls the mutation", async () => {
    const deleteButton = screen.getByText('projectList.deleteProjectModal.delete')
    const deleteProjectMutationMock = mocks[0].result
    fireEvent.click(deleteButton)
    await waitFor(() => expect(deleteProjectMutationMock).toHaveBeenCalled())
  })
})
