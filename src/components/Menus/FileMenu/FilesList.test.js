import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import FilesList from "./FilesList";

describe("When project has multiple files", () => {
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "a",
              extension: "py"
            },
            {
              name: "b",
              extension: "py"
            },
            {
              name: "c",
              extension: "py"
            }
          ]
        },
        isEmbedded: false
      },
      auth: {
        user: null 
      }
    }
    const store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><FilesList /></Provider>))
  })

  test("Renders all file names", () => {
    expect(queryByText("a.py")).not.toBeNull()
    expect(queryByText("b.py")).not.toBeNull()
    expect(queryByText("c.py")).not.toBeNull()
  })
})
