import configureStore from 'redux-mock-store';
import { prettyDOM, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import HtmlRunner from "./HtmlRunner";

describe('When page first loaded', () => {
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: 'index',
              extension: 'html',
              content: '<p>hello world</p>'
            }
          ]
        },
        focussedFileIndex: 0,
        openFiles: ['index.html'],
        // justLoaded: true
        codeRunTriggered: true,
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><HtmlRunner /></Provider>);
  })

  test('Renders', async () => {
    console.log(prettyDOM(screen.container))
    await waitFor(() => expect(screen.queryByText('hello world')).toBeInTheDocument(), {timeout: 3000})
  })
})

// describe('When focussed file changes')

// describe('When run button clicked')
