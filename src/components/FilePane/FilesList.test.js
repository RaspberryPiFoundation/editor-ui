import React from "react";
import { render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import FilesList from "./FilesList";

describe("When project has multiple files", () => {

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
    render(<Provider store={store}><div id="app"><FilesList /></div></Provider>)
  })

  test("Renders all file names", () => {
    expect(screen.queryByText("a.py")).not.toBeNull()
    expect(screen.queryByText("b.py")).not.toBeNull()
    expect(screen.queryByText("c.py")).not.toBeNull()
  })

  test("Renders a rename file button for each file", () => {
    expect(screen.getAllByTitle('Edit').length).toBe(3)
  })
})

describe("When the file name is main.py", () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
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
    render(<Provider store={store}><div id="app"><FilesList /></div></Provider>)
  })

  test('Does not render the rename file button', () => {
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
  })
})
