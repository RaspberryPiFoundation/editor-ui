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

describe("When logged in", () => {
  let store;
  let remixButton;
  let saveButton;
  let findByText;
  let getByText;

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
        user: {
          access_token: "39a09671-be55-4847-baf5-8919a0c24a25"
        }
      }
    }
    store = mockStore(initialState);
    ({findByText, getByText} = render(<Provider store={store}><Project/></Provider>));
    remixButton = getByText(/Remix/)
    saveButton = getByText(/Save/)
  })

  test("Save button renders when logged in", () => {
      expect(saveButton.textContent).toBe("Save Project");
  })

  test("Clicking save button sends PUT request to correct endpoint", () => {
    axios.put.mockImplementationOnce(() => Promise.resolve({}))
    fireEvent.click(saveButton)
    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const project = {"components": [], "identifier": "hello-world-project"}
    const headers = {"headers": {"Accept": "application/json"}}
    expect(axios.put).toHaveBeenCalledWith(`${api_host}/api/projects/phrases/hello-world-project`, {"project": project}, headers)
  })

  test("Remix button renders when the user is logged in", () => {
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

  test("No remix button when not logged in", () => {
    expect(queryByText('Remix')).toBeNull();
  })

  test("Save button not shown when not logged in", () =>{
    expect(queryByText("Save Project")).toBeNull();
})

describe("Testing remixed project", () => {
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
