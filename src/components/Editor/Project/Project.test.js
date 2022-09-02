import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Project from "./Project";

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

test("Renders with file menu if not for web component", () => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: []
        }
      }
    }
    const store = mockStore(initialState);
  const {queryByText} = render(<Provider store={store}><Project/></Provider>)
  expect(queryByText('Project Files')).not.toBeNull()
})

test("Renders without file menu if for web component", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      project: {
        components: []
      }
    }
  }
  const store = mockStore(initialState);
const {queryByText} = render(<Provider store={store}><Project forWebComponent={true}/></Provider>)
expect(queryByText('Project Files')).toBeNull()
})
