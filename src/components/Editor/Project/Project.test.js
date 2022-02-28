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
        user: []
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

  test("Save button not shown when not logged in", () =>{
    expect(queryByText("Save Project")).toBeNull();
  })
})
