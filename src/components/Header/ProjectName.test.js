import React from "react";
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event";
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
let graphqlMocks

beforeEach(() => {
  graphqlMocks = [
    {
      request: {
        query: RENAME_PROJECT_MUTATION,
        variables: { id: project.id, name: updatedName }
      },
      result: jest.fn(() => ({
        data: {
          __typename: "Mutation",
          updateProject: {
            project: {
              id: project.id,
              name: updatedName,
              __typename: "Project"
            },
            __typename: "UpdateProjectPayload"
          }
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
  render(<MockedProvider mocks={graphqlMocks}><Provider store={store}><ProjectName project={project}/></Provider></MockedProvider>);
  editButton = screen.queryByRole('button')
})

test('Project name renders in a heading', () => {
  expect(screen.queryByText(project.name).tagName).toBe('H1')
})

test('Clicking edit button changes the project name to an input field', async () => {
  const user = userEvent.setup()
  await user.click(editButton)
  expect(screen.queryByRole('textbox')).toHaveValue(project.name)
})

test('Clicking edit button transfers focus to input field', async () => {
  const user = userEvent.setup()
  await user.click(editButton)
  expect(screen.queryByRole('textbox')).toHaveFocus()
})

describe('When input field loses focus', () => {
  beforeEach(async () => {
    const user = userEvent.setup()
    await user.click(editButton)

    const inputField = screen.queryByRole('textbox')
    await user.clear(inputField)
    await user.keyboard(updatedName)
    inputField.blur()
  })

  test('Updates project name', async () => {
    expect(store.getActions()).toEqual([updateProjectName(updatedName)])
    await waitFor(() => expect(graphqlMocks[0].result).toHaveBeenCalled())
  })

  test('Changes project name to heading', async () => {
    await waitFor(() => expect(screen.queryByText(project.name).tagName).toBe('H1'))
  })

  describe('When the project has no ID set (maybe because the graphql state is missing)', () => {
    const project = {
      identifier: "hello-world-project",
      name: "Hello world",
      user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    }

    test('Does not call graphql mutation', async () => {
      expect(store.getActions()).toEqual([updateProjectName(updatedName)])
      await waitFor(() => expect(graphqlMocks[0].result).not.toHaveBeenCalled())
    })
  })
})

describe('When Enter is pressed', () => {
  beforeEach(async () => {
    const user = userEvent.setup()
    await user.click(editButton)

    const inputField = screen.queryByRole('textbox')
    await user.clear(inputField)
    await user.keyboard(updatedName)
    await user.keyboard('[Enter]')
  })

  test('Updates project name', async () => {
    expect(store.getActions()).toEqual([updateProjectName(updatedName)])
    await waitFor(() => expect(graphqlMocks[0].result).toHaveBeenCalled())
  })

  test('Changes project name to heading', () => {
    expect(screen.queryByText(project.name).tagName).toBe('H1')
  })

})

describe('When Escape is pressed', () => {
  beforeEach(async() => {
    const user = userEvent.setup()
    await user.click(editButton)

    const inputField = screen.queryByRole('textbox')
    await user.clear(inputField)
    await user.keyboard(updatedName)
    await user.keyboard('[Escape]')
  })

  test('Does not update project name', async () => {
    expect(store.getActions()).toEqual([])
    await waitFor(() => expect(graphqlMocks[0].result).not.toHaveBeenCalled())
  })

  test('Changes project name to heading', () => {
    expect(screen.queryByText(project.name).tagName).toBe('H1')
  })
})
