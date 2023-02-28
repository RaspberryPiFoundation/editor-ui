import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import FilesList from "./FilesList";

const openFileTab = jest.fn()

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
    render(<Provider store={store}><div id="app"><FilesList openFileTab={openFileTab}/></div></Provider>)
  })

  test("Renders all file names", () => {
    expect(screen.queryByText("a.py")).not.toBeNull()
    expect(screen.queryByText("b.py")).not.toBeNull()
    expect(screen.queryByText("c.py")).not.toBeNull()
  })

  test("Renders a menu button for each file", () => {
    expect(screen.getAllByTitle('filePane.fileMenu.label').length).toBe(3)
  })

  test('Clicking file name opens file tab',() => {
    fireEvent.click(screen.queryByText('a.py').parentElement)
    expect(openFileTab).toHaveBeenCalledWith('a.py')
  })
})
