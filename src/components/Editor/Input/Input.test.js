import React from "react";
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Input from "./Input";
import { closeFile } from "../EditorSlice";

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
        openFiles: ['main.py', 'a.py'],
        focussedFileIndex: 1
      },
      auth: {
        user: null
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><div id="app"><Input/></div></Provider>)
  })

  test("Renders content of focussed file", () => {
    expect(screen.queryByText('# Your code here')).toBeInTheDocument()
  })

  test("Scrolls focussed file into view", () => {
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  test('Clicking the file close button dispatches close action', async () => {
    const user = userEvent.setup()
    const closeButton = screen.queryAllByRole('button')[0]
    await user.click(closeButton)
    await waitFor(() => expect(store.getActions()).toEqual([closeFile('a.py')]))
  })
})
