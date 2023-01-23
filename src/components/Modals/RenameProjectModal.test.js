import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import RenameProjectModal from "./RenameProjectModal";
import { syncProject } from "../Editor/EditorSlice";

jest.mock('../Editor/EditorSlice', () => ({
  ...jest.requireActual('../Editor/EditorSlice'),
  syncProject: jest.fn((_) => jest.fn())
}))

describe("Testing the rename project modal", () => {
  let store;
  let inputBox;
  let saveButton;
  let user = {
    access_token: 'my_access_token'
  }
  let project = {
    name: 'my first project'
  }

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        modals: {
          renameProject: project
        },
        renameProjectModalShowing: true
      },
      auth: {user}
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id='app'><RenameProjectModal currentName='main' currentExtension='py' fileKey={0} /></div></Provider>)
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

  test("Clicking save renames the project to the given name", async () => {
      const saveAction = {type: 'SAVE_PROJECT' }
      const saveProject = jest.fn(() => saveAction)
      syncProject.mockImplementationOnce(jest.fn((_) => (saveProject)))

      fireEvent.change(inputBox, {target: {value: "renamed project"}})
      fireEvent.click(saveButton)
      await waitFor(() => expect(saveProject).toHaveBeenCalledWith({project: {name: 'renamed project'}, accessToken: user.access_token, autosave: false}))
      expect(store.getActions()[0]).toEqual(saveAction)
  })
})
