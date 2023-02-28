import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MockedProvider } from "@apollo/client/testing";

import { RenameProjectModal, RENAME_PROJECT_MUTATION } from "./RenameProjectModal";
import { showRenamedMessage } from '../../utils/Notifications';

jest.mock('../../utils/Notifications')

describe("RenameProjectModal", () => {
  let store
  let inputBox
  let saveButton
  let project = {
    name: 'my first project',
    id: 'XYZ'
  }
  let newName = 'renamed project'
  let mocks

  beforeEach(() => {
    const mocks = [
      {
        request: {
          query: RENAME_PROJECT_MUTATION,
          variables: { id: project.id, name: newName }
        },
        result: jest.fn(() => ({
          data: {
            id: project.id,
            name: newName,
            updatedAt: '2023-02-257T14:48:00Z'
          }
        }))
      }
    ]

    const mockStore = configureStore([])
    const initialState = {
      editor: {
        modals: {
          renameProject: project
        },
        renameProjectModalShowing: true
      }
    }
    store = mockStore(initialState);

    render(
      <MockedProvider mocks={mocks}>
        <Provider store={store}>
          <div id='app'><RenameProjectModal /></div>
        </Provider>
      </MockedProvider>
    )

    inputBox = screen.getByRole('textbox')
    saveButton = screen.getByText('projectList.renameProjectModal.save')
  })

  test('Modal renders', () => {
    expect(screen.getByText('projectList.renameProjectModal.heading')).not.toBeNull()
  })

  test('Clicking close button dispatches close modal action', () => {
    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)
    expect(store.getActions()).toEqual([{type: 'editor/closeRenameProjectModal'}])
  })

  test('Clicking cancel button closes modal and does not save', () => {
    const cancelButton = screen.queryByText('projectList.renameProjectModal.cancel')
    fireEvent.click(cancelButton)
    expect(store.getActions()).toEqual([{type: 'editor/closeRenameProjectModal'}])
  })

  test('Input box initially contains original project name', () => {
    expect(inputBox.value).toEqual('my first project')
  })

  test("Clicking save calls the mutation", async () => {
    const renameProjectMutationMock = mocks[0].result
    fireEvent.change(inputBox, {target: {value: "renamed project"}})
    fireEvent.click(saveButton)
    await waitFor(() => expect(renameProjectMutationMock).toHaveBeenCalled())
  })

  test("Clicking save eventually closes the modal", async () => {
      fireEvent.change(inputBox, {target: {value: "renamed project"}})
      fireEvent.click(saveButton)
      await waitFor(() => expect(store.getActions()).toEqual([{type: 'editor/closeRenameProjectModal'}]))
  })

  test("Clicking save eventually pops up the toast notification", async () => {
      fireEvent.change(inputBox, {target: {value: "renamed project"}})
      fireEvent.click(saveButton)
      await waitFor(() => expect(showRenamedMessage).toHaveBeenCalled())
  })
})
