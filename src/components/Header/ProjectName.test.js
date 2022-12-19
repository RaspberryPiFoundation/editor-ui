import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ProjectName from "./ProjectName";
import { updateProjectName } from "../Editor/EditorSlice";

const project = {
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
}

let store
let editButton

beforeEach(() => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><ProjectName/></Provider>);
    editButton = screen.queryByRole('button')
})

test('Project name renders in a heading', () => {
  expect(screen.queryByText(project.name).tagName).toBe('H1')
})

test('Clicking edit button changes the project name to an input field', () => {
  fireEvent.click(editButton)
  expect(screen.queryByRole('textbox')).toHaveValue(project.name)
})

test('Clicking edit button transfers focus to input field', () => {
  fireEvent.click(editButton)
  expect(screen.queryByRole('textbox')).toHaveFocus()
})

describe('When input field loses focus', () => {
  beforeEach(() => {
    fireEvent.click(editButton)
    const inputField = screen.queryByRole('textbox')
    inputField.blur()
  })

  test('Updates project name', () => {
    expect(store.getActions()).toEqual([updateProjectName(project.name)])
  })

  test('Changes project name to heading', async () => {
    await waitFor(() => expect(screen.queryByText(project.name).tagName).toBe('H1'))
  })
})

describe('When Enter is pressed', () => {
  beforeEach(() => {
    fireEvent.click(editButton)
    const inputField = screen.queryByRole('textbox')
    fireEvent.keyDown(inputField, { key: 'Enter'})
  })

  test('Updates project name', () => {
    expect(store.getActions()).toEqual([updateProjectName(project.name)])
  })

  test('Changes project name to heading', () => {
    expect(screen.queryByText(project.name).tagName).toBe('H1')
  })
})

describe('When Escape is pressed', () => {
  beforeEach(() => {
    fireEvent.click(editButton)
    const inputField = screen.queryByRole('textbox')
    fireEvent.keyDown(inputField, { key: 'Escape'})
  })

  test('Updates project name', () => {
    expect(store.getActions()).toEqual([])
  })

  test('Changes project name to heading', () => {
    expect(screen.queryByText(project.name).tagName).toBe('H1')
  })
})
