import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';

import Project from "./Project";
import axios from "axios";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

describe("When logged in and user owns project", () => {
  let store;
  let saveButton;
  let getByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          components: [],
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
    ({getByText} = render(<Provider store={store}><Project/></Provider>));
    saveButton = getByText(/Save/)
  })

  test("Save button renders", () => {
      expect(saveButton.textContent).toBe("Save Project");
  })

  test("Clicking save button sends PUT request to correct endpoint", () => {
    axios.put.mockImplementationOnce(() => Promise.resolve({}))
    fireEvent.click(saveButton)
    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const access_token = "39a09671-be55-4847-baf5-8919a0c24a25"
    const user_id = "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    const project = {"components": [], "identifier": "hello-world-project", "user_id": user_id}
    const headers = {"headers": {"Accept": "application/json", "Authorization": access_token}}
    expect(axios.put).toHaveBeenCalledWith(`${api_host}/api/projects/phrases/hello-world-project`, {"project": project}, headers)
  })

  test("No remix button", () => {
    expect(queryByText('Remix')).toBeNull();
  })
})

describe("When logged in and user does not own project", () => {
  let store;
  let remixButton;
  let getByText;
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          components: [],
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
    ({getByText, queryByText} = render(<Provider store={store}><Project/></Provider>));
    remixButton = getByText(/Remix/)
  })

  test("No save button", () => {
    expect(queryByText("Save Project")).toBeNull()
  })

  test("Remix button renders", () => {
    expect(remixButton.textContent).toBe("Remix Project");
  })

  test("Clicking remix button posts to correct remix url", () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({'data': { 'project': {'identifier': 'remixed-hello-project', 'project_type': 'python'}}}))

    fireEvent.click(remixButton)
    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const projectIdentifier = store.getState()['editor']['project']['identifier']
    const accessToken = store.getState()['auth']['user']['access_token']
    expect(axios.post).toHaveBeenCalledWith(`${api_host}/api/projects/phrases/${projectIdentifier}/remix`, {}, {"headers": {"Accept": "application/json", "Authorization": accessToken}})
  })
})

describe("When not logged in", () => {
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
        editor: {
          project: {
            identifier: "hello-world-project",
            components: []
          },
        },
        auth: {
          user: null
        }
      }
    const store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><Project/></Provider>));
  })

  test("No remix button", () => {
    expect(queryByText('Remix')).toBeNull();
  })

  test("No save button", () =>{
    expect(queryByText("Save Project")).toBeNull();
  })
})

describe("When viewing a remixed project", () => {
  let getByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          components: [],
          parent: {
            name: "hello world",
            identifier: "remixed-parent-project"
          },
          project_type: "python"
        }
      },
      auth: {
        user: null
      }
    }
    const store = mockStore(initialState);
    ({getByText} = render(<Provider store={store}><Project/></Provider>));
  })

  test("Project name is shown", () => {
    expect(getByText(/Remixed from/).innerHTML).toContain("hello world")
  })

  test("Project link is correct", () => {
    const host = `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }`
    expect(getByText(/hello world/).href).toBe(`${host}/python/remixed-parent-project`)
  })
})
