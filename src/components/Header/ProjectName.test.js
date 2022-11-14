import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event";
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from "axios";

import ProjectName from "./ProjectName";
import { showRemixedMessage } from '../../utils/Notifications'

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

jest.mock('../../utils/Notifications')

describe("When logged in and user owns project", () => {
  let store;
  let getByRole;
  let queryByTitle;
  let queryByRole;

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
    ({getByRole, queryByRole, queryByTitle} = render(<Provider store={store}><ProjectName/></Provider>));
  })

  test("Name renders in input box", () => {
    expect(queryByRole('textbox', {value: "Hello world"})).not.toBeNull()
  })

  test("Typing in the input box dispatches project update", () => {
    const textBox = getByRole('textbox');
    fireEvent.click(textBox)
    userEvent.type(textBox, '!')
    const expectedActions = [{type: 'editor/updateProjectName', payload: 'Hello world!'}]
    expect(store.getActions()).toEqual(expectedActions);
  })

  test("No remix button", () => {
    expect(queryByTitle('Remix')).toBeNull();
  })
})

describe("When logged in and user does not own project", () => {
  let store;
  let remixButton;
  let queryByText;
  let getByTitle;
  let queryByTitle;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          name: 'Hello world',
          user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
        },
      },
      auth: {
        user: {
          access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
          profile: {
            user: "5254370e-26d2-4c8a-9526-8dbafea43aa9"
          }
        }
      }
    }
    store = mockStore(initialState);
    ({getByTitle, queryByTitle, queryByText} = render(<Provider store={store}><ProjectName/></Provider>));
  })

  test("Name renders", () => {
    expect(queryByText(/Hello world/)).not.toBeNull()
  })

  test("Remix button renders", () => {
    expect(queryByTitle('Remix')).not.toBeNull();
  })

  test("Clicking remix button posts to correct remix url", () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({'data': { 'project': {'identifier': 'remixed-hello-project', 'project_type': 'python'}}}))

    remixButton = getByTitle("Remix").parentElement
    fireEvent.click(remixButton)
    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const projectIdentifier = store.getState()['editor']['project']['identifier']
    const accessToken = store.getState()['auth']['user']['access_token']
    expect(axios.post).toHaveBeenCalledWith(
      `${api_host}/api/projects/${projectIdentifier}/remix`,
      {
        "project":
        {
          "identifier": "hello-world-project",
          "name": "Hello world",
          "user_id": "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
        }
      },
      {"headers": {"Accept": "application/json", "Authorization": accessToken}})
  })

  test('Successful remix shows project remixed message', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({status: 200, data: {}}))
    remixButton = getByTitle("Remix").parentElement
    fireEvent.click(remixButton)
    await waitFor(() => expect(showRemixedMessage).toHaveBeenCalled())
  })
})

describe("When not logged in", () => {
  let queryByText;
  let queryByTitle;

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
    ({queryByTitle, queryByText} = render(<Provider store={store}><ProjectName/></Provider>));
  })

  test("Name renders", () => {
    expect(queryByText(/Hello world/)).not.toBeNull()
  })

  test("No remix button", () => {
    expect(queryByTitle('Remix')).toBeNull();
  })
})

describe("When project has no name", () => {
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {},
        },
        auth: {}
      }
    const store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><ProjectName/></Provider>));
  })

  test("Renders title as New Project", () => {
    expect(queryByText('header.newProject')).not.toBeNull()
  })
})
