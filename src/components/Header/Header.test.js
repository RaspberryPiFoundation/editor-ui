import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from "axios";
import { showSavedMessage } from "../../utils/Notifications";

import Header from "./Header";

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
  let saveButton;
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          components: [],
          image_list: [],
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
    ({queryByText} = render(<Provider store={store}><Header/></Provider>));
    saveButton = queryByText('header.save')
  })

  test("Save button renders", () => {
      expect(saveButton).toBeInTheDocument();
  })

  test("Clicking save button sends PUT request to correct endpoint", () => {
    axios.put.mockImplementationOnce(() => Promise.resolve({}))
    fireEvent.click(saveButton)
    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const access_token = "39a09671-be55-4847-baf5-8919a0c24a25"
    const user_id = "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    const project = {"components": [], "image_list": [], "identifier": "hello-world-project", "user_id": user_id}
    const headers = {"headers": {"Accept": "application/json", "Authorization": access_token}}
    expect(axios.put).toHaveBeenCalledWith(`${api_host}/api/projects/hello-world-project`, {"project": project}, headers)
  })

  test("Clicking save button dispatches project once returned", async () => {
    const project = {"components": [], "identifier": "hello-world-project", "user_id": "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"}
    axios.put.mockImplementationOnce(() => Promise.resolve({ status: 200, data: project }))
    fireEvent.click(saveButton)
    await new Promise(process.nextTick);
    const actions = store.getActions();
    const expectedPayload = { type: 'editor/setProject', payload: project }
    expect(actions).toEqual([expectedPayload])
  })

  test("Renders project gallery link", () => {
    expect(queryByText('header.projects')).not.toBeNull();
  })
})

describe("When logged in and no project identifier", () => {
  let store;
  let saveButton;
  let getByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [],
          image_list: [],
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
    ({getByText} = render(<Provider store={store}><Header/></Provider>));
    saveButton = getByText('header.save')
  })

  test("Save button is shown", () => {
    expect(saveButton).toBeInTheDocument()
  })

  test("Clicking save creates new project", () => {
    const project = {"components": [], "identifier": "hello-world-project", "user_id": "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"}
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 200, data: project}))
    fireEvent.click(saveButton)
    const api_host = process.env.REACT_APP_API_ENDPOINT;
    const access_token = "39a09671-be55-4847-baf5-8919a0c24a25"
    const user_id = "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    const new_project = {"components": [], "image_list": [], "user_id": user_id}
    const headers = {"headers": {"Accept": "application/json", "Authorization": access_token}}
    expect(axios.post).toHaveBeenCalledWith(`${api_host}/api/projects`, {"project": new_project}, headers)
  })

  test("Successful save prompts success message", async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 200, data: {}}))
    fireEvent.click(saveButton)
    await waitFor(() => expect(showSavedMessage).toHaveBeenCalled())
  })
})

describe("When logged in and user does not own project", () => {
  let store;
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          identifier: "hello-world-project",
          components: [],
          image_list: [],
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
    ({queryByText} = render(<Provider store={store}><Header/></Provider>));
  })

  test("Renders project gallery link", () => {
    expect(queryByText('header.projects')).not.toBeNull();
  })

  test("No save button", () => {
    expect(queryByText('header.save')).toBeNull()
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
            components: [],
            image_list: [],
          },
        },
        auth: {
          user: null
        }
      }
    const store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><Header/></Provider>));
  })

  test("No save button", () =>{
    expect(queryByText('header.save')).toBeNull();
  })

  test("No project gallery link", () => {
    expect(queryByText('header.projects')).toBeNull();
  })
})
