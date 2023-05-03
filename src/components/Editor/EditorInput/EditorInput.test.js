import React from "react"
import configureStore from 'redux-mock-store'
import EditorInput from "./EditorInput"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { closeFile } from "../EditorSlice"

window.HTMLElement.prototype.scrollIntoView = jest.fn()

describe('opening and closing different files', () => {
  let store

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: 'main',
              extension: 'py',
              content: 'print("hello")'
            },
            {
              name: 'a',
              extension: 'py',
              content: '# Your code here'
            }
          ]
        },
        openFiles: [['main.py', 'a.py']],
        focussedFileIndices: [1]
      },
      auth: {
        user: null
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id="app"><EditorInput/></div></Provider>)
  })

  test("Renders content of focussed file", () => {
    expect(screen.queryByText('# Your code here')).toBeInTheDocument()
  })

  test("Scrolls focussed file into view", () => {
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  test('Clicking the file close button dispatches close action', () => {
    const closeButton = screen.queryAllByRole('button')[2]
    fireEvent.click(closeButton)
    expect(store.getActions()).toEqual([closeFile('a.py')])
  })
})
