import React from "react";
import { fireEvent, render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';
import { toast } from 'react-toastify';

import Project from "./Project";
import axios from "axios";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

// jest.mock('react-toastify', () => ({
//   ...jest.requireActual('react-toastify'),
//   toast: () => ({
//       POSITION: jest.fn(),
//     }),
//   toast: jest.fn()
//     // const actual = jest.requireActual('react-toastify');
//     // Object.assign(actual, {toast: jest.fn()});
//     // return actual;
// }))

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
    expect(axios.put).toHaveBeenCalledWith(`${api_host}/api/projects/phrases/hello-world-project`, {"project": project})
  })

//   test("Clicking save shows the toast message", () => {
//     axios.put.mockImplementationOnce(() => Promise.resolve({status: 200}))
//     // var toastCalls = []
//     // toast.mockImplementationOnce((...args) => {
//     //     // console.log("triggered")
//     //     toastCalls.push(args)
//     //     // const position = {"TOP_CENTER": 0}
//     //     // Promise.resolve({'POSITION': position})
//     // })
//     // toast.POSITION.mockImplementationOnce(() => Promise.resolve({"TOP_CENTER":0}))

//     // toast.mockImplementationOnce((message, config) => {
//     //     Promise.resolve({POSITION: {}, message: message})

//     // })
//     // // toast.position.mockImplementationOnce(() => 0)
//     // // const toastMessage = await findByText(/saved/)
//     // fireEvent.click(saveButton)
//     // expect(toastCalls).toEqual(["Project saved!"])

//   })

})
