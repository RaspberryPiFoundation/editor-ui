import React from "react";
import { render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import FilesList from "./FilesList";

describe("When project has multiple files", () => {

  beforeEach(() => {
    const mockStore = configureStore([])
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
    expect(screen.getAllByRole('button', { expanded: false }).length).toBe(3)
  })
})
