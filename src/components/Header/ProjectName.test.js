import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MockedProvider } from "@apollo/client/testing"
import { updateProjectName } from "../Editor/EditorSlice";
import { ProjectName, RENAME_PROJECT_MUTATION} from "./ProjectName";
import { act } from "react-test-renderer";

const project = {
  id: "ABC",
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
}

let updatedName = "New project name"

let store
let editButton
let mocks

beforeEach(() => {
  mocks = [
    {
      request: {
        query: RENAME_PROJECT_MUTATION,
        variables: { id: project.id, name: updatedName }
      },
      result: jest.fn(() => ({
        data: {
          id: project.id,
          name: updatedName
        }
      }))
    }
  ]

  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      project: project,
    }
  }
  store = mockStore(initialState);
  render(<MockedProvider mocks={mocks}><Provider store={store}><ProjectName project={project}/></Provider></MockedProvider>);
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
    fireEvent.change(inputField, { target: {value: updatedName} })
    inputField.blur()
  })

  test('Updates project name', async () => {
    expect(store.getActions()).toEqual([updateProjectName(updatedName)])
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
  })

  test('Changes project name to heading', async () => {
    await waitFor(() => expect(screen.queryByText(project.name).tagName).toBe('H1'))
  })
})

describe('When Enter is pressed', () => {
  beforeEach(() => {
    fireEvent.click(editButton)
    const inputField = screen.queryByRole('textbox')
    fireEvent.change(inputField, { target: {value: updatedName} })
    fireEvent.keyDown(inputField, { key: 'Enter'})
  })

  test('Updates project name', () => {
    expect(store.getActions()).toEqual([updateProjectName(updatedName)])
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
