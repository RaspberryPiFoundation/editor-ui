import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from 'redux-mock-store';
import ProjectListItem from "./ProjectListItem";

jest.mock('date-fns')

let store
<<<<<<< HEAD
let project = {name: 'my amazing project'}
=======
let project = {identifier: 'hello-world-project', name: 'my amazing project'}
>>>>>>> 8e7ac27 (Delete project action)

beforeEach(() => {
  const mockStore = configureStore([])
  const initialState = {}
  store = mockStore(initialState);

  render(<Provider store={store}><ProjectListItem project = {project} user={{}}/></Provider>)
})

test('Renders project name', () => {
  expect(screen.queryByText(project.name)).toBeInTheDocument()
})

test('Clicking rename button opens rename project modal', () => {
  const renameButton = screen.queryByText('projectList.rename')
  fireEvent.click(renameButton)
  expect(store.getActions()).toEqual([{type: "editor/showRenameProjectModal", payload: project}])
})
<<<<<<< HEAD
=======

test('Clicking delete button opens delete project modal', () => {
  const deleteButton = screen.queryByText('projectList.delete')
  fireEvent.click(deleteButton)
  expect(store.getActions()).toEqual([{type: "editor/showDeleteProjectModal", payload: project}])
})
>>>>>>> 8e7ac27 (Delete project action)
