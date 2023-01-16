import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from 'redux-mock-store'
import { showRenamedMessage } from "../../utils/Notifications";

import ProjectIndex from "./ProjectIndex";

jest.mock('../../utils/Notifications')
jest.mock('date-fns')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

describe ('When user has projects', () => {
  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {
        projectList: [
          { name: 'my project 1' },
          { name: 'my project 2' }
        ],
        projectListLoaded: 'success'
      },
      auth: {}
    }
    const store = mockStore(initialState)
    render (
      <Provider store={store}>
        <ProjectIndex/>
      </Provider>
    )
  })

  test('Displays project titles', () => {
    expect(screen.queryByText('my project 1')).toBeInTheDocument()
    expect(screen.queryByText('my project 2')).toBeInTheDocument()
  })
})

describe ('When saving is success', () => {
  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {
        saving: 'success'
      },
      auth: {}
    }
    const store = mockStore(initialState)
    render (
      <Provider store={store}>
        <ProjectIndex/>
      </Provider>
    )
  })

  test('Shows project renamed message', () => {
    expect(showRenamedMessage).toHaveBeenCalled()
  })
})
